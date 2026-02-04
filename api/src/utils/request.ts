import type { Request } from 'express'

/**
 * Helper to get request ID from request object for standardized API responses.
 */
export const getRequestId = (req: Request): string => req.requestId || 'unknown'
