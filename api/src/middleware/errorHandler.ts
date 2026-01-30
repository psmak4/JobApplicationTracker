import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import { ErrorCodes, errorResponse, validationErrorResponse } from '../utils/responses'

/**
 * Extend Express Request to include requestId
 */
declare global {
	namespace Express {
		interface Request {
			requestId: string
		}
	}
}

/**
 * Generate a unique request ID
 */
function generateRequestId(): string {
	return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
}

/**
 * Middleware to add request ID to each request
 */
export function requestIdMiddleware(req: Request, _res: Response, next: NextFunction): void {
	req.requestId = generateRequestId()
	next()
}

/**
 * Format Zod validation errors into a detailed error object
 */
function formatZodErrors(error: ZodError): Record<string, string[]> {
	const formatted: Record<string, string[]> = {}

	for (const issue of error.issues) {
		const path = issue.path.join('.') || 'general'
		if (!formatted[path]) {
			formatted[path] = []
		}
		formatted[path].push(issue.message)
	}

	return formatted
}

/**
 * Global error handler middleware
 * 
 * This catches all unhandled errors and returns standardized JSON responses.
 * It should be the LAST middleware added to the Express app.
 */
export function errorHandler(
	err: Error,
	req: Request,
	res: Response,
	_next: NextFunction,
): void {
	const requestId = req.requestId || generateRequestId()

	// Log the error with request ID for debugging
	console.error(`[Error] Request ${requestId}:`, {
		message: err.message,
		stack: err.stack,
		path: req.path,
		method: req.method,
	})

	// Handle Zod validation errors
	if (err instanceof ZodError) {
		const details = formatZodErrors(err)
		res.status(400).json(
			validationErrorResponse('Validation failed. Please check your input.', requestId, details),
		)
		return
	}

	// Handle specific error types
	if (err.name === 'ValidationError') {
		res.status(400).json(
			errorResponse(ErrorCodes.VALIDATION_ERROR, err.message, requestId),
		)
		return
	}

	// Handle syntax errors (malformed JSON)
	if (err.name === 'SyntaxError' && 'body' in err) {
		res.status(400).json(
			errorResponse(ErrorCodes.BAD_REQUEST, 'Invalid JSON in request body', requestId),
		)
		return
	}

	// Default: Internal server error (don't expose internal details)
	res.status(500).json(
		errorResponse(
			ErrorCodes.INTERNAL_ERROR,
			'An unexpected error occurred. Please try again later.',
			requestId,
		),
	)
}

/**
 * 404 handler for undefined routes
 * 
 * This should be added after all routes but before the error handler
 */
export function notFoundHandler(req: Request, res: Response): void {
	const requestId = req.requestId || generateRequestId()

	res.status(404).json(
		errorResponse(
			ErrorCodes.NOT_FOUND,
			`Route ${req.method} ${req.path} not found`,
			requestId,
		),
	)
}
