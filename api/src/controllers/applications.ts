import { and, desc, eq, gte, inArray } from 'drizzle-orm'
import { NextFunction, Request, Response } from 'express'
import { ZodError, z } from 'zod'
import { db } from '../db/index'
import { applicationStatusEnum, applications, calendarEvents, statusHistory } from '../db/schema'
import { getRequestId } from '../utils/request'
import { errorResponse, successResponse } from '../utils/responses'

// Zod schemas for validation with input sanitization (trim whitespace)
const createApplicationSchema = z.object({
	company: z
		.string()
		.min(1, 'Company name is required')
		.transform((v) => v.trim()),
	jobTitle: z
		.string()
		.min(1, 'Job title is required')
		.transform((v) => v.trim()),
	jobDescriptionUrl: z.string().url().optional().or(z.literal('')),
	salary: z
		.string()
		.optional()
		.transform((v) => (v ? v.trim() : v)),
	location: z
		.string()
		.optional()
		.transform((v) => (v ? v.trim() : v)),
	workType: z.enum(['Remote', 'Hybrid', 'On-site']).optional(),
	contactInfo: z
		.string()
		.optional()
		.transform((v) => (v ? v.trim() : v)),
	notes: z
		.string()
		.optional()
		.transform((v) => (v ? v.trim() : v)),
	status: z.enum(applicationStatusEnum.enumValues).default('Applied'), // Initial status
	date: z.string().optional(),
})

const updateApplicationSchema = createApplicationSchema
	.omit({ status: true })
	.partial()
	.extend({
		status: z.enum(applicationStatusEnum.enumValues).optional(),
	})

export const applicationController = {
	// Get all applications for the logged-in user
	// Uses Drizzle relational queries to avoid N+1 problem
	getAll: async (req: Request, res: Response) => {
		try {
			const userId = req.user!.id

			// Use relational query to fetch applications with their status history in one query
			const userApplications = await db.query.applications.findMany({
				where: eq(applications.userId, userId),
				with: {
					statusHistory: {
						orderBy: [desc(statusHistory.date), desc(statusHistory.createdAt)],
					},
				},
				orderBy: [desc(applications.updatedAt)],
			})

			res.json(successResponse(userApplications, getRequestId(req)))
		} catch (error) {
			console.error('Error fetching applications:', error)
			res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to fetch applications', getRequestId(req)))
		}
	},
	// Lightweight list of applications (no full status history)
	getList: async (req: Request, res: Response) => {
		try {
			const userId = req.user!.id

			const applicationList = await db.query.applications.findMany({
				where: eq(applications.userId, userId),
				columns: {
					id: true,
					company: true,
					jobTitle: true,
					jobDescriptionUrl: true,
					salary: true,
					location: true,
					workType: true,
					contactInfo: true,
					notes: true,
					createdAt: true,
					updatedAt: true,
				},
				with: {
					statusHistory: {
						columns: {
							status: true,
							date: true,
							createdAt: true,
						},
						orderBy: [desc(statusHistory.date), desc(statusHistory.createdAt)],
						limit: 1,
					},
				},
				orderBy: [desc(applications.updatedAt)],
			})

			const applicationIds = applicationList.map((app) => app.id)

			if (applicationIds.length === 0) {
				res.json(successResponse([], getRequestId(req)))
				return
			}

			const startOfToday = new Date()
			startOfToday.setHours(0, 0, 0, 0)

			// Query upcoming events from calendarEvents table
			const upcomingEvents = await db
				.select({
					id: calendarEvents.id,
					applicationId: calendarEvents.applicationId,
					googleEventId: calendarEvents.googleEventId,
					title: calendarEvents.title,
					url: calendarEvents.url,
					startTime: calendarEvents.startTime,
					endTime: calendarEvents.endTime,
				})
				.from(calendarEvents)
				.where(
					and(
						inArray(calendarEvents.applicationId, applicationIds),
						gte(calendarEvents.startTime, startOfToday),
					),
				)
				.orderBy(desc(calendarEvents.startTime))

			const eventsByApplication = new Map<string, typeof upcomingEvents>()

			for (const event of upcomingEvents) {
				const existing = eventsByApplication.get(event.applicationId)
				if (existing) {
					existing.push(event)
				} else {
					eventsByApplication.set(event.applicationId, [event])
				}
			}

			const response = applicationList.map((app) => {
				const { statusHistory: latestStatusHistory, ...appData } = app
				const latestStatus = latestStatusHistory[0]

				return {
					...appData,
					currentStatus: latestStatus?.status ?? null,
					lastStatusDate: latestStatus?.date ?? null,
					upcomingEvents: eventsByApplication.get(app.id) ?? [],
				}
			})

			res.json(successResponse(response, getRequestId(req)))
		} catch (error) {
			console.error('Error fetching application list:', error)
			res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to fetch applications', getRequestId(req)))
		}
	},

	// Get a single application details (including history and calendar events)
	// Uses Drizzle relational queries to fetch application, status history, and events in one query
	getOne: async (req: Request, res: Response) => {
		try {
			const userId = req.user!.id
			const applicationId = req.params.id as string

			const application = await db.query.applications.findFirst({
				where: and(eq(applications.id, applicationId), eq(applications.userId, userId)),
				with: {
					statusHistory: {
						orderBy: [desc(statusHistory.date), desc(statusHistory.createdAt)],
					},
					calendarEvents: {
						orderBy: [desc(calendarEvents.startTime)],
					},
				},
			})

			if (!application) {
				res.status(404).json(errorResponse('NOT_FOUND', 'Application not found', getRequestId(req)))
				return
			}

			res.json(successResponse(application, getRequestId(req)))
		} catch (error) {
			console.error('Error fetching application:', error)
			res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to fetch application', getRequestId(req)))
		}
	},

	// Create a new application
	create: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const userId = req.user!.id
			const validation = createApplicationSchema.safeParse(req.body)

			if (!validation.success) {
				// Let the error handler middleware handle Zod errors for consistent formatting
				next(validation.error)
				return
			}

			const { status, date, ...appData } = validation.data
			const statusDate = date
				? new Date(date).toISOString().split('T')[0]
				: new Date().toISOString().split('T')[0]

			// Transaction to create app and initial status
			const result = await db.transaction(async (tx) => {
				const [newApp] = await tx
					.insert(applications)
					.values({
						...appData,
						userId,
					})
					.returning()

				const [initialStatus] = await tx
					.insert(statusHistory)
					.values({
						applicationId: newApp.id,
						status: status,
						date: statusDate,
					})
					.returning()

				return { ...newApp, currentStatus: initialStatus }
			})

			res.status(201).json(successResponse(result, getRequestId(req)))
		} catch (error) {
			if (error instanceof ZodError) {
				next(error)
				return
			}
			console.error('Error creating application:', error)
			res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to create application', getRequestId(req)))
		}
	},

	// Update an application
	update: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const userId = req.user!.id
			const applicationId = req.params.id as string
			const validation = updateApplicationSchema.safeParse(req.body)

			if (!validation.success) {
				// Let the error handler middleware handle Zod errors for consistent formatting
				next(validation.error)
				return
			}

			// Ensure user owns the application
			const existingApp = await db.query.applications.findFirst({
				where: and(eq(applications.id, applicationId), eq(applications.userId, userId)),
			})

			if (!existingApp) {
				res.status(404).json(errorResponse('NOT_FOUND', 'Application not found', getRequestId(req)))
				return
			}

			const { status, date, ...updateData } = validation.data

			const updatedApp = await db.transaction(async (tx) => {
				const [app] = await tx
					.update(applications)
					.set({ ...updateData, updatedAt: new Date() })
					.where(eq(applications.id, applicationId))
					.returning()

				if (!app) {
					return null
				}

				// If status is provided and different from current, add to history
				// Note: This logic assumes the client sends 'status' only when it changes or wants to force an update.
				// To be robust, we should check the latest status in DB.
				if (status) {
					// Check latest status
					const [latestStatus] = await tx
						.select()
						.from(statusHistory)
						.where(eq(statusHistory.applicationId, applicationId))
						.orderBy(desc(statusHistory.date), desc(statusHistory.createdAt))
						.limit(1)

					if (!latestStatus || latestStatus.status !== status) {
						const statusDate = date
							? new Date(date).toISOString().split('T')[0]
							: new Date().toISOString().split('T')[0]

						await tx.insert(statusHistory).values({
							applicationId: applicationId,
							status: status,
							date: statusDate,
						})
					}
				}

				return app
			})

			if (!updatedApp) {
				res.status(404).json(errorResponse('NOT_FOUND', 'Application not found', getRequestId(req)))
				return
			}

			res.json(successResponse(updatedApp, getRequestId(req)))
		} catch (error) {
			if (error instanceof ZodError) {
				next(error)
				return
			}
			console.error('Error updating application:', error)
			res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to update application', getRequestId(req)))
		}
	},

	// Delete an application
	delete: async (req: Request, res: Response) => {
		try {
			const userId = req.user!.id
			const applicationId = req.params.id as string

			const [deleted] = await db
				.delete(applications)
				.where(and(eq(applications.id, applicationId), eq(applications.userId, userId)))
				.returning()

			if (!deleted) {
				res.status(404).json(errorResponse('NOT_FOUND', 'Application not found', getRequestId(req)))
				return
			}

			res.json(successResponse({ message: 'Application deleted successfully' }, getRequestId(req)))
		} catch (error) {
			console.error('Error deleting application:', error)
			res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to delete application', getRequestId(req)))
		}
	},
}
