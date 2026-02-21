import { logger } from '@/config/logger'
import { and, asc, desc, eq, isNull } from 'drizzle-orm'
import { NextFunction, Request, Response } from 'express'
import { ZodError, z } from 'zod'
import { db } from '@/db/index'
import { applications, notes } from '@/db/schema'
import { getRequestId } from '@/utils/request'
import { errorResponse, successResponse } from '@/utils/responses'

const createNoteSchema = z.object({
	content: z
		.string()
		.min(1, 'Note content is required')
		.transform((v) => v.trim()),
})

export const noteController = {
	// Get all notes for a specific application
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

			const notesList = await db
				.select()
				.from(notes)
				.where(eq(notes.applicationId, applicationId))
				.orderBy(desc(notes.createdAt))

			res.json(successResponse(notesList, getRequestId(req)))
		} catch (error) {
			logger.error({ err: error }, 'Error fetching notes:')
			res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to fetch notes', getRequestId(req)))
		}
	},

	// Create a new note for an application
	create: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const userId = req.user!.id
			const { applicationId } = req.params as { applicationId: string }
			const validation = createNoteSchema.safeParse(req.body)

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

			const [newNote] = await db
				.insert(notes)
				.values({
					applicationId,
					content: validation.data.content,
				})
				.returning()

			// Update the application's updatedAt timestamp
			await db.update(applications).set({ updatedAt: new Date() }).where(eq(applications.id, applicationId))

			res.status(201).json(successResponse(newNote, getRequestId(req)))
		} catch (error) {
			if (error instanceof ZodError) {
				next(error)
				return
			}
			logger.error({ err: error }, 'Error creating note:')
			res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to create note', getRequestId(req)))
		}
	},

	// Delete a note
	delete: async (req: Request, res: Response) => {
		try {
			const userId = req.user!.id
			const { id } = req.params as { id: string }

			// Find the note with its related application to check ownership
			const note = await db.query.notes.findFirst({
				where: eq(notes.id, id),
				with: {
					application: true,
				},
			})

			if (!note || !note.application || note.application.userId !== userId) {
				res.status(404).json(errorResponse('NOT_FOUND', 'Note not found', getRequestId(req)))
				return
			}

			await db.delete(notes).where(eq(notes.id, id))

			res.json(successResponse({ message: 'Note deleted' }, getRequestId(req)))
		} catch (error) {
			logger.error({ err: error }, 'Error deleting note:')
			res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to delete note', getRequestId(req)))
		}
	},
}
