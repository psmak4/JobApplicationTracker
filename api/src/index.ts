import { toNodeHandler } from 'better-auth/node'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'

import { auth } from './auth'
import { authProtection } from './middleware/rateLimiter'
import applicationRoutes from './routes/applications'
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

app.get('/', (_, res) => {
	res.send('Job Tracker API is running')
})

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`)
})
