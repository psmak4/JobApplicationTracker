import { Request, Response, Router } from 'express'
import { createProtection } from '../middleware/rateLimiter'
import { requireAdmin } from '../middleware/requireAdmin'
import { notificationService } from '../services/notifications'

const router = Router()

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
			res.status(400).json({
				message: 'Invalid template type. Must be "verification" or "passwordReset"',
			})
			return
		}

		const user = req.user
		if (!user?.email || !user?.name) {
			res.status(400).json({ message: 'User email or name not found' })
			return
		}

		// Create a dummy URL for testing purposes
		const testUrl = 'https://example.com/test-action?token=test-token-12345'

		if (templateType === 'verification') {
			await notificationService.sendVerificationEmail(user.email, user.name, testUrl)
		} else {
			await notificationService.sendPasswordReset(user.email, user.name, testUrl)
		}

		res.json({
			success: true,
			message: `Test ${templateType} email sent to ${user.email}`,
		})
	} catch (error) {
		console.error('Failed to send test email:', error)
		res.status(500).json({
			message: 'Failed to send test email',
			error: error instanceof Error ? error.message : 'Unknown error',
		})
	}
})

/**
 * GET /api/admin/email/templates
 * Returns the list of available email templates
 */
router.get('/email/templates', (_req, res) => {
	res.json({
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
	})
})

export default router
