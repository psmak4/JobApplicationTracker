import { fromNodeHeaders } from 'better-auth/node'
import { NextFunction, Request, Response } from 'express'
import { auth } from '../auth'
import { errorResponse } from '../utils/responses'

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const session = await auth.api.getSession({
			headers: fromNodeHeaders(req.headers),
		})

		if (!session) {
			res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required', 'auth'))
			return
		}

		// Attach user/session to request for use in controllers
		// Types are properly extended in types/express.d.ts
		req.user = session.user
		req.session = session.session

		next()
	} catch (error) {
		console.error('Auth middleware error:', error)
		res.status(500).json(errorResponse('INTERNAL_ERROR', 'Authentication check failed', 'auth'))
	}
}

