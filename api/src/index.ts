import { toNodeHandler } from 'better-auth/node'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { auth } from './auth'
import applicationRoutes from './routes/applications'
import statusRoutes from './routes/statuses'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

app.use(
	cors({
		origin: ['http://localhost:5173', 'http://localhost:3000'], // Allow frontend origins
		credentials: true, // Required for cookies/session
	}),
)

app.use(express.json())

// Better Auth handler
app.all('/api/auth/*path', toNodeHandler(auth))

// API Routes
app.use('/api/applications', applicationRoutes)
app.use('/api/statuses', statusRoutes)

app.get('/', (_, res) => {
	res.send('Job Tracker API is running')
})

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`)
})
