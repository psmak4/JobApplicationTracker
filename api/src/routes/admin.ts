import { Router } from 'express'
import { requireAdmin } from '@/middleware/requireAdmin'
import { auth } from '@/auth'

const router = Router()

router.use(requireAdmin)

router.post('/users/bulk-delete', async (req, res) => {
	const { userIds } = req.body

	if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
		return res.status(400).json({ error: 'userIds array is required' })
	}

	const results = {
		success: [] as string[],
		failed: [] as { userId: string; error: string }[],
	}

	for (const userId of userIds) {
		try {
			await auth.api.removeUser({
				headers: req.headers as Record<string, string>,
				body: { userId },
			})
			results.success.push(userId)
		} catch (error) {
			results.failed.push({
				userId,
				error: error instanceof Error ? error.message : 'Unknown error',
			})
		}
	}

	return res.json(results)
})

export default router
