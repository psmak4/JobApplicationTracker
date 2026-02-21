import { logger } from '@/config/logger'
import { and, desc, eq, isNull } from 'drizzle-orm'
import { NextFunction, Request, Response } from 'express'
import { ZodError, z } from 'zod'
import { db } from '@/db/index'
import { applications, calendarEvents } from '@/db/schema'
import { getRequestId } from '@/utils/request'
import { errorResponse, successResponse } from '@/utils/responses'

const createEventSchema = z.object({
	googleEventId: z.string().optional(),
	title: z.string().min(1, 'Title is required'),
	url: z.string().optional(),
	startTime: z.string().refine(
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
	endTime: z.string().optional().or(z.null()),
})

export const eventController = {
	// Get all events for a specific application
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

			const events = await db
				.select()
				.from(calendarEvents)
				.where(eq(calendarEvents.applicationId, applicationId))
				.orderBy(desc(calendarEvents.startTime))

			res.json(successResponse(events, getRequestId(req)))
		} catch (error) {
			logger.error({ err: error }, 'Error fetching calendar events:')
			res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to fetch calendar events', getRequestId(req)))
		}
	},

	// Create a new calendar event for an application
	create: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const userId = req.user!.id
			const { applicationId } = req.params as { applicationId: string }
			const validation = createEventSchema.safeParse(req.body)

			if (!validation.success) {
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

			const [newEvent] = await db
				.insert(calendarEvents)
				.values({
					applicationId,
					googleEventId: validation.data.googleEventId,
					title: validation.data.title,
					url: validation.data.url,
					startTime: new Date(validation.data.startTime),
					endTime: validation.data.endTime ? new Date(validation.data.endTime) : null,
				})
				.returning()

			// Update the application's updatedAt timestamp
			await db.update(applications).set({ updatedAt: new Date() }).where(eq(applications.id, applicationId))

			res.status(201).json(successResponse(newEvent, getRequestId(req)))
		} catch (error) {
			if (error instanceof ZodError) {
				next(error)
				return
			}
			logger.error({ err: error }, 'Error creating calendar event:')
			res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to create calendar event', getRequestId(req)))
		}
	},

	// Delete a calendar event
	delete: async (req: Request, res: Response) => {
		try {
			const userId = req.user!.id
			const { id } = req.params as { id: string }

			// Find the event with its related application to check ownership
			const event = await db.query.calendarEvents.findFirst({
				where: eq(calendarEvents.id, id),
				with: {
					application: true,
				},
			})

			if (!event || !event.application || event.application.userId !== userId) {
				res.status(404).json(errorResponse('NOT_FOUND', 'Calendar event not found', getRequestId(req)))
				return
			}

			await db.delete(calendarEvents).where(eq(calendarEvents.id, id))

			res.json(successResponse({ message: 'Calendar event deleted' }, getRequestId(req)))
		} catch (error) {
			logger.error({ err: error }, 'Error deleting calendar event:')
			res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to delete calendar event', getRequestId(req)))
		}
	},
}
