import { fromNodeHeaders } from 'better-auth/node'
import { NextFunction, Request, Response } from 'express'
import { auth } from '../auth'

/**
 * Middleware that requires the user to be authenticated AND have admin role.
 * Use this for admin-only endpoints.
 */
export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const session = await auth.api.getSession({
			headers: fromNodeHeaders(req.headers),
		})

		if (!session) {
			res.status(401).json({ message: 'Unauthorized' })
			return
		}

		// Check if user has admin role
		const user = session.user as { role?: string }
		if (user.role !== 'admin') {
			res.status(403).json({ message: 'Forbidden: Admin access required' })
			return
		}

		// Attach user/session to request for use in controllers
		req.user = session.user
		req.session = session.session

		next()
	} catch (error) {
		console.error('Admin middleware error:', error)
		res.status(500).json({ message: 'Internal Server Error' })
	}
}
