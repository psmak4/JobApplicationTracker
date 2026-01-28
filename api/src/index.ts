import { toNodeHandler } from 'better-auth/node'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { auth } from './auth'
import { authProtection } from './middleware/rateLimiter'
import applicationRoutes from './routes/applications'
import parserRoutes from './routes/parser'
import statusRoutes from './routes/statuses'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

// Parse CORS origins from environment variable, fallback to localhost for development
const allowedOrigins = process.env.CORS_ORIGINS
	? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
	: ['http://localhost:5173', 'http://localhost:3000']

app.use(
	cors({
		origin: allowedOrigins,
		credentials: true, // Required for cookies/session
	}),
)

app.use(express.json())

// Better Auth handler with rate limiting to prevent brute-force attacks
app.all('/api/auth/*path', ...authProtection, toNodeHandler(auth))

// API Routes
app.use('/api/applications', applicationRoutes)
app.use('/api/statuses', statusRoutes)
app.use('/api/parser', parserRoutes)
app.get('/', (_, res) => {
	res.send('Job Tracker API is running')
})

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
