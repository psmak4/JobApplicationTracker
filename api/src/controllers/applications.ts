import { and, desc, eq } from 'drizzle-orm'
import { NextFunction, Request, Response } from 'express'
import { z, ZodError } from 'zod'
import { db } from '../db/index'
import { applicationStatusEnum, applications, statusHistory } from '../db/schema'
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

	// Get a single application details (including history)
	// Uses Drizzle relational queries to fetch application and status history in one query
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

			// Update basic info
			const [updatedApp] = await db
				.update(applications)
				.set({ ...updateData, updatedAt: new Date() })
				.where(eq(applications.id, applicationId))
				.returning()

			// If status is provided and different from current, add to history
			// Note: This logic assumes the client sends 'status' only when it changes or wants to force an update.
			// To be robust, we should check the latest status in DB.
			if (status) {
				// Check latest status
				const [latestStatus] = await db
					.select()
					.from(statusHistory)
					.where(eq(statusHistory.applicationId, applicationId))
					.orderBy(desc(statusHistory.date), desc(statusHistory.createdAt))
					.limit(1)

				if (!latestStatus || latestStatus.status !== status) {
					const statusDate = date
						? new Date(date).toISOString().split('T')[0]
						: new Date().toISOString().split('T')[0]

					await db.insert(statusHistory).values({
						applicationId: applicationId,
						status: status,
						date: statusDate,
					})
				}
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
