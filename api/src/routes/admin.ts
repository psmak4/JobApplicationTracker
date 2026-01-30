import { Request, Response, Router } from 'express'
import { createProtection } from '../middleware/rateLimiter'
import { requireAdmin } from '../middleware/requireAdmin'
import { notificationService } from '../services/notifications'
import { errorResponse, successResponse } from '../utils/responses'

const router = Router()

// Helper to get request ID from request object
const getRequestId = (req: Request): string => req.requestId || 'unknown'

// Apply admin auth middleware to all routes in this router
router.use(requireAdmin)

/**
 * POST /api/admin/email/test
 * Sends a test email to the logged-in admin's email address
 */
router.post('/email/test', createProtection, async (req: Request, res: Response) => {
	try {
		const { templateType } = req.body as { templateType: 'verification' | 'passwordReset' }

		if (!templateType || !['verification', 'passwordReset'].includes(templateType)) {
			res.status(400).json(
				errorResponse(
					'VALIDATION_ERROR',
					'Invalid template type. Must be "verification" or "passwordReset"',
					getRequestId(req),
					{
						templateType: ['Must be either "verification" or "passwordReset"'],
					},
				),
			)
			return
		}

		const user = req.user
		if (!user?.email || !user?.name) {
			res.status(400).json(
				errorResponse(
					'VALIDATION_ERROR',
					'User email or name not found',
					getRequestId(req),
				),
			)
			return
		}

		// Create a dummy URL for testing purposes
		const testUrl = 'https://example.com/test-action?token=test-token-12345'

		if (templateType === 'verification') {
			await notificationService.sendVerificationEmail(user.email, user.name, testUrl)
		} else {
			await notificationService.sendPasswordReset(user.email, user.name, testUrl)
		}

		res.json(
			successResponse(
				{ message: `Test ${templateType} email sent to ${user.email}` },
				getRequestId(req),
			),
		)
	} catch (error) {
		console.error('Failed to send test email:', error)
		res.status(500).json(
			errorResponse(
				'INTERNAL_ERROR',
				'Failed to send test email',
				getRequestId(req),
			),
		)
	}
})

/**
 * GET /api/admin/email/templates
 * Returns the list of available email templates
 */
router.get('/email/templates', (req: Request, res: Response) => {
	res.json(
		successResponse(
			{
				templates: [
					{
						id: 'verification',
						name: 'Email Verification',
						description: 'Sent when a user signs up to verify their email address',
					},
					{
						id: 'passwordReset',
						name: 'Password Reset',
						description: 'Sent when a user requests to reset their password',
					},
				],
			},
			getRequestId(req),
		),
	)
})

export default router
