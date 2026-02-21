import { logger } from '@/config/logger'
import { fromNodeHeaders } from 'better-auth/node'
import { NextFunction, Request, Response } from 'express'
import { auth } from '@/auth'
import { errorResponse } from '@/utils/responses'

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
			res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required', 'auth'))
			return
		}

		// Check if user has admin role
		const user = session.user as { role?: string }
		if (user.role !== 'admin') {
			res.status(403).json(errorResponse('FORBIDDEN', 'Admin access required', 'auth'))
			return
		}

		// Attach user/session to request for use in controllers
		req.user = session.user
		req.session = session.session

		next()
	} catch (error) {
		logger.error({ err: error }, 'Admin middleware error:')
		res.status(500).json(errorResponse('INTERNAL_ERROR', 'Authorization check failed', 'auth'))
	}
}
