import { toNodeHandler } from 'better-auth/node'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { auth } from './auth'
// Import env validation - this will validate env vars immediately on import
import { env } from './config/env'
import { errorHandler, notFoundHandler, requestIdMiddleware } from './middleware/errorHandler'
import { authProtection } from './middleware/rateLimiter'
import adminRoutes from './routes/admin'
import applicationRoutes from './routes/applications'
import calendarRoutes from './routes/calendar'
import parserRoutes from './routes/parser'
import statusRoutes from './routes/statuses'

const app = express()
const PORT = env.PORT

// Security middleware - add security headers
app.use(
	helmet({
		contentSecurityPolicy: {
			directives: {
				defaultSrc: ["'self'"],
				styleSrc: ["'self'", "'unsafe-inline'"], // Needed for some UI libraries
				scriptSrc: ["'self'"],
				imgSrc: ["'self'", 'data:', 'https:'],
				connectSrc: ["'self'", ...env.CORS_ORIGINS],
			},
		},
		crossOriginEmbedderPolicy: false, // Allow embedding for development
	}),
)

// CORS configuration
app.use(
	cors({
		origin: env.CORS_ORIGINS,
		credentials: true, // Required for cookies/session
	}),
)

// Request ID middleware - adds unique ID to each request for tracking
app.use(requestIdMiddleware)

app.use(express.json())

// Better Auth handler with rate limiting to prevent brute-force attacks
app.all('/api/auth/*path', ...authProtection, toNodeHandler(auth))

// API Routes
app.use('/api/admin', adminRoutes)
app.use('/api/applications', applicationRoutes)
app.use('/api/statuses', statusRoutes)
app.use('/api/calendar', calendarRoutes)
app.use('/api/parser', parserRoutes)
app.get('/', (_, res) => {
	res.send('Job Tracker API is running')
})

// 404 handler - must be after all routes
app.use(notFoundHandler)

// Global error handler - must be the LAST middleware
app.use(errorHandler)

const server = app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`)
})

const gracefulShutdown = (signal: string) => {
	console.log(`\n${signal} received. Starting graceful shutdown...`)

	server.close(() => {
		console.log('HTTP server closed')
		console.log('Graceful shutdown complete')
		process.exit(0)
	})

	setTimeout(() => {
		console.error('Forced shutdown after timeout')
		process.exit(1)
	}, 10000)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))
