import { logger } from '@/config/logger'
import { and, desc, eq, isNull, sql } from 'drizzle-orm'
import { NextFunction, Request, Response } from 'express'
import { ZodError, z } from 'zod'
import { db } from '@/db/index'
import { applicationStatusEnum, applications, statusHistory } from '@/db/schema'
import { getRequestId } from '@/utils/request'
import { errorResponse, successResponse } from '@/utils/responses'

const createStatusSchema = z.object({
	status: z.enum(applicationStatusEnum.enumValues),
	date: z
		.string()
		.refine(
			(date) => {
				try {
					return !isNaN(Date.parse(date))
				} catch (e) {
					return false
				}
			},
			{
				message: 'Invalid date format. Please use ISO 8601 date string.',
			},
		)
		.default(() => new Date().toISOString().split('T')[0]),
})

export const statusController = {
	// Get history for a specific application
	getByApplication: async (req: Request, res: Response) => {
		try {
			const userId = req.user!.id
			const { applicationId } = req.params as { applicationId: string }

			// Verify ownership
			const app = await db.query.applications.findFirst({
				where: and(
					eq(applications.id, applicationId),
					eq(applications.userId, userId),
					isNull(applications.archivedAt),
				),
			})

			if (!app) {
				res.status(404).json(errorResponse('NOT_FOUND', 'Application not found', getRequestId(req)))
				return
			}

			const history = await db
				.select()
				.from(statusHistory)
				.where(eq(statusHistory.applicationId, applicationId))
				.orderBy(desc(statusHistory.date))

			res.json(successResponse(history, getRequestId(req)))
		} catch (error) {
			logger.error({ err: error }, 'Error fetching status history:')
			res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to fetch status history', getRequestId(req)))
		}
	},

	// Add a new status entry
	create: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const userId = req.user!.id
			const { applicationId } = req.params as { applicationId: string }
			const validation = createStatusSchema.safeParse(req.body)

			if (!validation.success) {
				// Let the error handler middleware handle Zod errors for consistent formatting
				next(validation.error)
				return
			}

			// Verify ownership
			const app = await db.query.applications.findFirst({
				where: and(
					eq(applications.id, applicationId),
					eq(applications.userId, userId),
					isNull(applications.archivedAt),
				),
			})

			if (!app) {
				res.status(404).json(errorResponse('NOT_FOUND', 'Application not found', getRequestId(req)))
				return
			}

			// Date is already validated by Zod schema - use string format for date column
			const statusDate = validation.data.date

			const [newStatus] = await db
				.insert(statusHistory)
				.values({
					applicationId,
					status: validation.data.status,
					date: statusDate,
				})
				.returning()

			// Update the application's updatedAt timestamp
			await db.update(applications).set({ updatedAt: new Date() }).where(eq(applications.id, applicationId))

			res.status(201).json(successResponse(newStatus, getRequestId(req)))
		} catch (error) {
			if (error instanceof ZodError) {
				next(error)
				return
			}
			logger.error({ err: error }, 'Error creating status entry:')
			res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to create status entry', getRequestId(req)))
		}
	},

	// Get available status types (for dropdowns)
	getTypes: (req: Request, res: Response) => {
		res.json(successResponse(applicationStatusEnum.enumValues, getRequestId(req)))
	},

	// Delete a status entry
	delete: async (req: Request, res: Response) => {
		try {
			const userId = req.user!.id
			const { id } = req.params as { id: string }

			// Find the status entry with its related application to check ownership
			const statusEntry = await db.query.statusHistory.findFirst({
				where: eq(statusHistory.id, id),
				with: {
					application: true,
				},
			})

			// Type-safe check: statusEntry.application is properly typed via Drizzle relations
			if (!statusEntry || !statusEntry.application || statusEntry.application.userId !== userId) {
				res.status(404).json(errorResponse('NOT_FOUND', 'Status entry not found', getRequestId(req)))
				return
			}

			// Ensure we don't delete the last status entry
			const [countResult] = await db
				.select({ count: sql<number>`count(*)` })
				.from(statusHistory)
				.where(eq(statusHistory.applicationId, statusEntry.applicationId))

			const statusCount = Number(countResult?.count ?? 0)

			if (statusCount <= 1) {
				res.status(400).json(
					errorResponse('VALIDATION_ERROR', 'Cannot delete the only status entry', getRequestId(req)),
				)
				return
			}

			await db.delete(statusHistory).where(eq(statusHistory.id, id))

			res.json(successResponse({ message: 'Status entry deleted' }, getRequestId(req)))
		} catch (error) {
			logger.error({ err: error }, 'Error deleting status entry:')
			res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to delete status entry', getRequestId(req)))
		}
	},

	// Update a status entry (date only)
	update: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const userId = req.user!.id
			const { id } = req.params as { id: string }

			// We only allow updating the date for now
			const updateStatusSchema = z.object({
				date: z.string().refine(
					(date) => {
						try {
							return !isNaN(Date.parse(date))
						} catch (e) {
							return false
						}
					},
					{
						message: 'Invalid date format. Please use ISO 8601 date string.',
					},
				),
			})

			const validation = updateStatusSchema.safeParse(req.body)

			if (!validation.success) {
				next(validation.error)
				return
			}

			// Find the status entry with its related application to check ownership
			const statusEntry = await db.query.statusHistory.findFirst({
				where: eq(statusHistory.id, id),
				with: {
					application: true,
				},
			})

			// Type-safe check: statusEntry.application is properly typed via Drizzle relations
			if (!statusEntry || !statusEntry.application || statusEntry.application.userId !== userId) {
				res.status(404).json(errorResponse('NOT_FOUND', 'Status entry not found', getRequestId(req)))
				return
			}

			const statusDate = validation.data.date

			const [updatedStatus] = await db
				.update(statusHistory)
				.set({
					date: statusDate,
				})
				.where(eq(statusHistory.id, id))
				.returning()

			// Update the application's updatedAt timestamp
			await db
				.update(applications)
				.set({ updatedAt: new Date() })
				.where(eq(applications.id, statusEntry.applicationId))

			res.json(successResponse(updatedStatus, getRequestId(req)))
		} catch (error) {
			if (error instanceof ZodError) {
				next(error)
				return
			}
			logger.error({ err: error }, 'Error updating status entry:')
			res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to update status entry', getRequestId(req)))
		}
	},
}
