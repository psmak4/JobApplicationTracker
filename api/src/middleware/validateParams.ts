import type { NextFunction, Request, Response } from 'express'
import { errorResponse } from '@/utils/responses'

/**
 * Extend Express Request to include requestId
 * This duplicates the declaration from errorHandler.ts to ensure TypeScript knows about it
 */
declare global {
	namespace Express {
		interface Request {
			requestId: string
		}
	}
}

/**
 * UUID validation regex pattern
 * Matches standard UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/**
 * Validate that a string is a valid UUID
 */
export function isValidUUID(id: string): boolean {
	return UUID_REGEX.test(id)
}

/**
 * Middleware factory to validate UUID parameters
 *
 * Usage:
 *   router.get('/:id', validateUUID('id'), controller.getOne)
 *   router.get('/:applicationId/statuses', validateUUID('applicationId'), controller.getStatuses)
 *
 * @param paramName - The name of the URL parameter to validate
 */
export function validateUUID(paramName: string) {
	return (req: Request, res: Response, next: NextFunction): void => {
		const value = req.params[paramName]

		if (!value) {
			// Parameter not present, let it pass (other validation will catch it)
			next()
			return
		}

		// Handle case where param could be an array (shouldn't happen for :id routes)
		const valueStr = Array.isArray(value) ? value[0] : value

		if (!isValidUUID(valueStr)) {
			const requestId = req.requestId ? req.requestId : 'unknown'
			res.status(400).json(
				errorResponse('INVALID_PARAMETER', `Invalid ${paramName} format. Expected a valid UUID.`, requestId, {
					[paramName]: ['Must be a valid UUID format (e.g., 123e4567-e89b-12d3-a456-426614174000)'],
				}),
			)
			return
		}

		next()
	}
}

/**
 * Middleware to validate multiple UUID parameters at once
 *
 * Usage:
 *   router.get('/:id', validateUUIDs(['id']), controller.getOne)
 */
export function validateUUIDs(paramNames: string[]) {
	return (req: Request, res: Response, next: NextFunction): void => {
		const invalidParams: Record<string, string[]> = {}

		for (const paramName of paramNames) {
			const value = req.params[paramName]
			if (value) {
				// Handle case where param could be an array
				const valueStr = Array.isArray(value) ? value[0] : value
				if (!isValidUUID(valueStr)) {
					invalidParams[paramName] = ['Must be a valid UUID format']
				}
			}
		}

		if (Object.keys(invalidParams).length > 0) {
			const requestId = req.requestId ? req.requestId : 'unknown'
			res.status(400).json(
				errorResponse(
					'INVALID_PARAMETER',
					'Invalid parameter format. Please provide valid UUIDs.',
					requestId,
					invalidParams,
				),
			)
			return
		}

		next()
	}
}
