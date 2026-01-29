import type { Request } from 'express'
import rateLimit, { type RateLimitInfo } from 'express-rate-limit'
import slowDown from 'express-slow-down'

// Extend Request to include rateLimit info added by the middleware
interface RateLimitedRequest extends Request {
	rateLimit: RateLimitInfo
}

// ============================================================================
// RATE LIMITERS - Hard limits that block requests
// ============================================================================

// General API rate limiter - applies to all API routes
export const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per windowMs
	message: {
		error: 'Too many requests from this IP',
		message: 'You have exceeded the 100 requests in 15 minutes limit. Please try again later.',
		retryAfter: 900, // seconds
	},
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
	// Skip requests that don't need limiting
	skip: (req) => {
		// Skip health check endpoint
		return req.path === '/health'
	},
	handler: (req, res) => {
		const rateLimitInfo = (req as RateLimitedRequest).rateLimit
		res.status(429).json({
			error: 'Too many requests',
			message: 'You have exceeded the rate limit. Please try again later.',
			retryAfter: Math.ceil((rateLimitInfo.resetTime?.getTime() || Date.now()) / 1000),
			limit: rateLimitInfo.limit,
			used: rateLimitInfo.used,
		})
	},
})

// Stricter rate limiter for authentication endpoints
// Only applies to mutation endpoints (login, signup, password reset)
export const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 5, // Limit each IP to 5 login/signup attempts per windowMs
	skipSuccessfulRequests: true, // Don't count successful auth attempts
	// Skip read-only auth endpoints that don't need brute-force protection
	skip: (req) => {
		const readOnlyPaths = ['/api/auth/get-session', '/api/auth/session', '/api/auth/csrf']
		return readOnlyPaths.some((path) => req.path.startsWith(path))
	},
	message: {
		error: 'Too many authentication attempts',
		message: 'You have exceeded the maximum number of login attempts. Please try again in 15 minutes.',
		retryAfter: 900,
	},
	standardHeaders: true,
	legacyHeaders: false,
	handler: (req, res) => {
		const rateLimitInfo = (req as RateLimitedRequest).rateLimit
		res.status(429).json({
			error: 'Too many authentication attempts',
			message:
				'Account temporarily locked due to too many failed login attempts. Please try again in 15 minutes.',
			retryAfter: Math.ceil((rateLimitInfo.resetTime?.getTime() || Date.now()) / 1000),
		})
	},
})

// Rate limiter for creating/updating resources
export const createLimiter = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	max: 20, // Limit each IP to 20 create/update requests per minute
	message: {
		error: 'Too many create/update requests',
		message: 'You are creating or updating resources too quickly. Please slow down.',
		retryAfter: 60,
	},
	standardHeaders: true,
	legacyHeaders: false,
	handler: (req, res) => {
		const rateLimitInfo = (req as RateLimitedRequest).rateLimit
		res.status(429).json({
			error: 'Too many requests',
			message: 'You are making too many changes. Please wait a moment before trying again.',
			retryAfter: Math.ceil((rateLimitInfo.resetTime?.getTime() || Date.now()) / 1000),
		})
	},
})

// Rate limiter for delete operations (more restrictive)
export const deleteLimiter = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	max: 10, // Limit each IP to 10 delete requests per minute
	message: {
		error: 'Too many delete requests',
		message: 'You are deleting items too quickly. Please slow down.',
		retryAfter: 60,
	},
	standardHeaders: true,
	legacyHeaders: false,
	handler: (req, res) => {
		const rateLimitInfo = (req as RateLimitedRequest).rateLimit
		res.status(429).json({
			error: 'Too many delete operations',
			message: 'You are deleting too many items. Please wait a moment before continuing.',
			retryAfter: Math.ceil((rateLimitInfo.resetTime?.getTime() || Date.now()) / 1000),
		})
	},
})

// Rate limiter for parser endpoint (very restrictive due to external HTTP requests)
export const parserLimiter = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	max: 5, // Limit each IP to 5 parse requests per minute
	message: {
		error: 'Too many parse requests',
		message: 'You are parsing job postings too quickly. Please wait before trying again.',
		retryAfter: 60,
	},
	standardHeaders: true,
	legacyHeaders: false,
	handler: (req, res) => {
		const rateLimitInfo = (req as RateLimitedRequest).rateLimit
		res.status(429).json({
			error: 'Too many parse requests',
			message: 'You have exceeded the limit of 5 parse requests per minute. Please wait before trying again.',
			retryAfter: Math.ceil((rateLimitInfo.resetTime?.getTime() || Date.now()) / 1000),
		})
	},
})

// ============================================================================
// SPEED LIMITERS - Slow down requests instead of blocking
// ============================================================================

// General API speed limiter - slows down after threshold
export const apiSpeedLimiter = slowDown({
	windowMs: 15 * 60 * 1000, // 15 minutes
	delayAfter: 50, // Allow 50 requests per windowMs at full speed
	delayMs: (hits) => {
		// Gradually increase delay: 100ms, 200ms, 300ms, etc.
		const delayIncrement = 100
		return (hits - 50) * delayIncrement
	},
	maxDelayMs: 5000, // Maximum delay of 5 seconds
	// Skip requests that don't need slowing
	skip: (req) => {
		return req.path === '/health'
	},
})

// Speed limiter for authentication endpoints
// Only apply to mutation endpoints (login, signup, password reset)
// Skip read-only endpoints like get-session that are called frequently
export const authSpeedLimiter = slowDown({
	windowMs: 15 * 60 * 1000, // 15 minutes
	delayAfter: 5, // Allow 5 requests at full speed (was 3)
	delayMs: (hits) => {
		// Progressive delay: 300ms, 600ms, 900ms, etc. (was 500ms increments)
		return (hits - 5) * 300
	},
	maxDelayMs: 5000, // Maximum delay of 5 seconds (was 10)
	// Skip read-only auth endpoints that don't need brute-force protection
	skip: (req) => {
		const readOnlyPaths = ['/api/auth/get-session', '/api/auth/session', '/api/auth/csrf']
		return readOnlyPaths.some((path) => req.path.startsWith(path))
	},
})

// Speed limiter for create/update operations
export const createSpeedLimiter = slowDown({
	windowMs: 60 * 1000, // 1 minute
	delayAfter: 10, // Allow 10 requests at full speed
	delayMs: (hits) => {
		// Delay increases: 200ms, 400ms, 600ms, etc.
		return (hits - 10) * 200
	},
	maxDelayMs: 3000, // Maximum delay of 3 seconds
})

// Speed limiter for delete operations
export const deleteSpeedLimiter = slowDown({
	windowMs: 60 * 1000, // 1 minute
	delayAfter: 5, // Allow 5 deletes at full speed
	delayMs: (hits) => {
		// Aggressive delay: 500ms, 1000ms, 1500ms, etc.
		return (hits - 5) * 500
	},
	maxDelayMs: 5000, // Maximum delay of 5 seconds
})

// Speed limiter for parser endpoint (aggressive due to external HTTP requests)
export const parserSpeedLimiter = slowDown({
	windowMs: 60 * 1000, // 1 minute
	delayAfter: 2, // Allow 2 requests at full speed
	delayMs: (hits) => {
		// Very aggressive delay: 1000ms, 2000ms, 3000ms, etc.
		return (hits - 2) * 1000
	},
	maxDelayMs: 10000, // Maximum delay of 10 seconds
})

// ============================================================================
// COMBINED MIDDLEWARE - Apply both speed limiting and rate limiting
// ============================================================================

// Apply to general API routes (speed limit, then rate limit)
export const apiProtection = [apiSpeedLimiter, apiLimiter]

// Apply to auth routes (speed limit, then rate limit)
export const authProtection = [authSpeedLimiter, authLimiter]

// Apply to create/update routes (speed limit, then rate limit)
export const createProtection = [createSpeedLimiter, createLimiter]

// Apply to delete routes (speed limit, then rate limit)
export const deleteProtection = [deleteSpeedLimiter, deleteLimiter]

// Apply to parser routes (speed limit, then rate limit)
export const parserProtection = [parserSpeedLimiter, parserLimiter]
