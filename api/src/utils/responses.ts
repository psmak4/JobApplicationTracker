/**
 * Standardized API response helpers
 * 
 * Note: Frontend will need to be updated to handle these response formats:
 * - Success responses are wrapped in { data: ... } with optional metadata
 * - Error responses include detailed validation errors when applicable
 */

interface SuccessResponse<T> {
	success: true
	data: T
	meta?: {
		timestamp: string
		requestId: string
		[key: string]: unknown
	}
}

interface ErrorResponse {
	success: false
	error: {
		code: string
		message: string
		details?: Record<string, string[]>
	}
	meta?: {
		timestamp: string
		requestId: string
	}
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse

/**
 * Create a standardized success response
 */
export function successResponse<T>(
	data: T,
	requestId: string,
	meta?: Record<string, unknown>,
): SuccessResponse<T> {
	return {
		success: true,
		data,
		meta: {
			timestamp: new Date().toISOString(),
			requestId,
			...meta,
		},
	}
}

/**
 * Create a standardized error response
 */
export function errorResponse(
	code: string,
	message: string,
	requestId: string,
	details?: Record<string, string[]>,
): ErrorResponse {
	return {
		success: false,
		error: {
			code,
			message,
			...(details && { details }),
		},
		meta: {
			timestamp: new Date().toISOString(),
			requestId,
		},
	}
}

/**
 * Create a validation error response with field-level details
 * 
 * Frontend note: Check error.details for field-specific validation errors
 */
export function validationErrorResponse(
	message: string,
	requestId: string,
	details: Record<string, string[]>,
): ErrorResponse {
	return errorResponse('VALIDATION_ERROR', message, requestId, details)
}

/**
 * Common error codes for consistent API responses
 */
export const ErrorCodes = {
	VALIDATION_ERROR: 'VALIDATION_ERROR',
	NOT_FOUND: 'NOT_FOUND',
	UNAUTHORIZED: 'UNAUTHORIZED',
	FORBIDDEN: 'FORBIDDEN',
	INTERNAL_ERROR: 'INTERNAL_ERROR',
	RATE_LIMITED: 'RATE_LIMITED',
	BAD_REQUEST: 'BAD_REQUEST',
} as const

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes]
