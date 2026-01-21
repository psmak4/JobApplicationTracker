import { and, desc, eq, inArray } from 'drizzle-orm'
import { Request, Response } from 'express'
import { z } from 'zod'
import { db } from '../db/index'
import { applicationStatusEnum, applications, statusHistory } from '../db/schema'

// Zod schemas for validation
const createApplicationSchema = z.object({
	company: z.string().min(1, 'Company name is required'),
	jobTitle: z.string().min(1, 'Job title is required'),
	jobDescriptionUrl: z.string().url().optional().or(z.literal('')),
	salary: z.string().optional(),
	location: z.string().optional(),
	workType: z.enum(['Remote', 'Hybrid', 'On-site']).optional(),
	contactInfo: z.string().optional(),
	notes: z.string().optional(),
	status: z.enum(applicationStatusEnum.enumValues).default('Applied'), // Initial status
	date: z.string().optional(),
})

const updateApplicationSchema = createApplicationSchema.partial()

export const applicationController = {
	// Get all applications for the logged-in user
	getAll: async (req: Request, res: Response) => {
		try {
			const userId = (req as any).user.id

			const userApplications = await db
				.select()
				.from(applications)
				.where(eq(applications.userId, userId))
				.orderBy(desc(applications.updatedAt))

			if (userApplications.length === 0) {
				res.json([])
				return
			}

			const appIds = userApplications.map((app) => app.id)
			const allHistories = await db
				.select()
				.from(statusHistory)
				.where(inArray(statusHistory.applicationId, appIds))
				.orderBy(desc(statusHistory.date))

			const appsWithHistory = userApplications.map((app) => ({
				...app,
				statusHistory: allHistories.filter((h) => h.applicationId === app.id),
			}))

			res.json(appsWithHistory)
		} catch (error) {
			console.error('Error fetching applications:', error)
			res.status(500).json({ message: 'Failed to fetch applications' })
		}
	},

	// Get a single application details (including history)
	getOne: async (req: Request, res: Response) => {
		try {
			const userId = (req as any).user.id
			const applicationId = req.params.id as string

			const application = await db.query.applications.findFirst({
				where: and(eq(applications.id, applicationId), eq(applications.userId, userId)),
			})

			if (!application) {
				res.status(404).json({ message: 'Application not found' })
				return
			}

			const statusHistoryList = await db
				.select()
				.from(statusHistory)
				.where(eq(statusHistory.applicationId, applicationId))
				.orderBy(desc(statusHistory.date))

			res.json({ ...application, statusHistory: statusHistoryList })
		} catch (error) {
			console.error('Error fetching application:', error)
			res.status(500).json({ message: 'Failed to fetch application' })
		}
	},

	// Create a new application
	create: async (req: Request, res: Response) => {
		try {
			const userId = (req as any).user.id
			const validation = createApplicationSchema.safeParse(req.body)

			if (!validation.success) {
				res.status(400).json({ errors: validation.error.format() })
				return
			}

			const { status, date, ...appData } = validation.data

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
						status: status as any,
						date: date ? date.split('T')[0] : new Date().toISOString().split('T')[0],
					})
					.returning()

				return { ...newApp, currentStatus: initialStatus }
			})

			res.status(201).json(result)
		} catch (error) {
			console.error('Error creating application:', error)
			res.status(500).json({ message: 'Failed to create application' })
		}
	},

	// Update an application
	update: async (req: Request, res: Response) => {
		try {
			const userId = (req as any).user.id
			const applicationId = req.params.id as string
			const validation = updateApplicationSchema.safeParse(req.body)

			if (!validation.success) {
				res.status(400).json({ errors: validation.error.format() })
				return
			}

			// Ensure user owns the application
			const existingApp = await db.query.applications.findFirst({
				where: and(eq(applications.id, applicationId), eq(applications.userId, userId)),
			})

			if (!existingApp) {
				res.status(404).json({ message: 'Application not found' })
				return
			}

			const { status, ...updateData } = validation.data

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
					.orderBy(desc(statusHistory.date))
					.limit(1)

				if (!latestStatus || latestStatus.status !== status) {
					await db.insert(statusHistory).values({
						applicationId: applicationId,
						status: status as any,
						date: new Date().toISOString().split('T')[0],
					})
				}
			}

			res.json(updatedApp)
		} catch (error) {
			console.error('Error updating application:', error)
			res.status(500).json({ message: 'Failed to update application' })
		}
	},

	// Delete an application
	delete: async (req: Request, res: Response) => {
		try {
			const userId = (req as any).user.id
			const applicationId = req.params.id as string

			// Drizzle's "cascade" in schema definition handles the statusHistory deletion usually if foreign keys are set up in DB.
			// Our schema.ts has `references(() => users.id, { onDelete: "cascade" })` but let's verify logic.

			const [deleted] = await db
				.delete(applications)
				.where(and(eq(applications.id, applicationId), eq(applications.userId, userId)))
				.returning()

			if (!deleted) {
				res.status(404).json({ message: 'Application not found' })
				return
			}

			res.json({ message: 'Application deleted successfully' })
		} catch (error) {
			console.error('Error deleting application:', error)
			res.status(500).json({ message: 'Failed to delete application' })
		}
	},
}
