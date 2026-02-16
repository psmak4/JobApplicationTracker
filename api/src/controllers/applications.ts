import { and, asc, desc, eq, gte, inArray, isNotNull, isNull } from 'drizzle-orm'
import { NextFunction, Request, Response } from 'express'
import { ZodError, z } from 'zod'
import { db } from '../db/index'
import { applicationStatusEnum, applications, calendarEvents, notes } from '../db/schema'
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
	status: z.enum(applicationStatusEnum.enumValues).default('Applied'),
	appliedAt: z.string().optional(),
})

const updateApplicationSchema = createApplicationSchema
	.omit({ status: true })
	.partial()
	.extend({
		status: z.enum(applicationStatusEnum.enumValues).optional(),
		appliedAt: z.string().optional(),
	})

// Active statuses shown on the dashboard
const ACTIVE_STATUSES = ['Applied', 'Interviewing', 'Offer Received'] as const

export const applicationController = {
	// Lightweight list of applications (no history joins needed)
	getList: async (req: Request, res: Response) => {
		try {
			const userId = req.user!.id

			const applicationList = await db.query.applications.findMany({
				where: and(eq(applications.userId, userId), isNull(applications.archivedAt)),
				columns: {
					id: true,
					company: true,
					jobTitle: true,
					jobDescriptionUrl: true,
					salary: true,
					location: true,
					workType: true,
					contactInfo: true,
					status: true,
					appliedAt: true,
					statusUpdatedAt: true,
					createdAt: true,
					updatedAt: true,
				},
				orderBy: [asc(applications.company)],
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
				.orderBy(asc(calendarEvents.startTime))

			const eventsByApplication = new Map<string, typeof upcomingEvents>()

			for (const event of upcomingEvents) {
				const existing = eventsByApplication.get(event.applicationId)
				if (existing) {
					existing.push(event)
				} else {
					eventsByApplication.set(event.applicationId, [event])
				}
			}

			const response = applicationList.map((app) => ({
				...app,
				upcomingEvents: eventsByApplication.get(app.id) ?? [],
			}))

			res.json(successResponse(response, getRequestId(req)))
		} catch (error) {
			console.error('Error fetching application list:', error)
			res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to fetch applications', getRequestId(req)))
		}
	},

	// Active applications list (Applied, Interviewing, Offer Received)
	getActiveList: async (req: Request, res: Response) => {
		try {
			const userId = req.user!.id

			const applicationList = await db.query.applications.findMany({
				where: and(
					eq(applications.userId, userId),
					isNull(applications.archivedAt),
					inArray(applications.status, [...ACTIVE_STATUSES]),
				),
				columns: {
					id: true,
					company: true,
					jobTitle: true,
					jobDescriptionUrl: true,
					salary: true,
					location: true,
					workType: true,
					contactInfo: true,
					status: true,
					appliedAt: true,
					statusUpdatedAt: true,
					createdAt: true,
					updatedAt: true,
				},
				orderBy: [asc(applications.company)],
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
				.orderBy(asc(calendarEvents.startTime))

			const eventsByApplication = new Map<string, typeof upcomingEvents>()

			for (const event of upcomingEvents) {
				const existing = eventsByApplication.get(event.applicationId)
				if (existing) {
					existing.push(event)
				} else {
					eventsByApplication.set(event.applicationId, [event])
				}
			}

			const response = applicationList.map((app) => ({
				...app,
				upcomingEvents: eventsByApplication.get(app.id) ?? [],
			}))

			res.json(successResponse(response, getRequestId(req)))
		} catch (error) {
			console.error('Error fetching active application list:', error)
			res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to fetch applications', getRequestId(req)))
		}
	},

	// Get a single application details (including calendar events)
	getOne: async (req: Request, res: Response) => {
		try {
			const userId = req.user!.id
			const applicationId = req.params.id as string

			const application = await db.query.applications.findFirst({
				where: and(
					eq(applications.id, applicationId),
					eq(applications.userId, userId),
					isNull(applications.archivedAt),
				),
				with: {
					calendarEvents: {
						orderBy: [desc(calendarEvents.startTime)],
					},
					notes: {
						orderBy: [desc(notes.createdAt)],
					},
				},
			})

			if (!application) {
				res.status(404).json(errorResponse('NOT_FOUND', 'Application not found', getRequestId(req)))
				return
			}

			// Omit statusHistory from the response and rename notes relation to noteEntries
			const { statusHistory: _sh, notes: noteEntries, ...appData } = application as any
			res.json(successResponse({ ...appData, noteEntries }, getRequestId(req)))
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
				next(validation.error)
				return
			}

			const { status, appliedAt, ...appData } = validation.data
			const now = new Date()
			const appliedAtDate = appliedAt ? new Date(appliedAt) : now

			const [newApp] = await db
				.insert(applications)
				.values({
					...appData,
					userId,
					status,
					appliedAt: appliedAtDate,
					statusUpdatedAt: now,
				})
				.returning()

			res.status(201).json(successResponse(newApp, getRequestId(req)))
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

			const { status, appliedAt, ...updateData } = validation.data
			const now = new Date()

			// Build the update set
			const updateSet: Record<string, unknown> = {
				...updateData,
				updatedAt: now,
			}

			// If appliedAt is provided, update it
			if (appliedAt) {
				updateSet.appliedAt = new Date(appliedAt)
			}

			// If status is provided and different from current, update status and statusUpdatedAt
			if (status && status !== existingApp.status) {
				updateSet.status = status
				updateSet.statusUpdatedAt = now
			}

			const [updatedApp] = await db
				.update(applications)
				.set(updateSet)
				.where(eq(applications.id, applicationId))
				.returning()

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

	// Archive an application
	archive: async (req: Request, res: Response) => {
		try {
			const userId = req.user!.id
			const applicationId = req.params.id as string

			const [archivedApp] = await db
				.update(applications)
				.set({
					archivedAt: new Date(),
					updatedAt: new Date(),
				})
				.where(and(eq(applications.id, applicationId), eq(applications.userId, userId)))
				.returning()

			if (!archivedApp) {
				res.status(404).json(errorResponse('NOT_FOUND', 'Application not found', getRequestId(req)))
				return
			}

			res.json(successResponse(archivedApp, getRequestId(req)))
		} catch (error) {
			console.error('Error archiving application:', error)
			res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to archive application', getRequestId(req)))
		}
	},
	// Get archived applications list
	getArchivedList: async (req: Request, res: Response) => {
		try {
			const userId = req.user!.id

			const applicationList = await db.query.applications.findMany({
				where: and(eq(applications.userId, userId), isNotNull(applications.archivedAt)),
				columns: {
					id: true,
					company: true,
					jobTitle: true,
					status: true,
					archivedAt: true,
					updatedAt: true,
				},
				orderBy: [desc(applications.archivedAt)],
			})

			res.json(successResponse(applicationList, getRequestId(req)))
		} catch (error) {
			console.error('Error fetching archived applications:', error)
			res.status(500).json(
				errorResponse('INTERNAL_ERROR', 'Failed to fetch archived applications', getRequestId(req)),
			)
		}
	},

	// Restore an archived application
	restore: async (req: Request, res: Response) => {
		try {
			const userId = req.user!.id
			const applicationId = req.params.id as string

			const [restoredApp] = await db
				.update(applications)
				.set({
					archivedAt: null,
					updatedAt: new Date(),
				})
				.where(and(eq(applications.id, applicationId), eq(applications.userId, userId)))
				.returning()

			if (!restoredApp) {
				res.status(404).json(errorResponse('NOT_FOUND', 'Application not found', getRequestId(req)))
				return
			}

			res.json(successResponse(restoredApp, getRequestId(req)))
		} catch (error) {
			console.error('Error restoring application:', error)
			res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to restore application', getRequestId(req)))
		}
	},
}
