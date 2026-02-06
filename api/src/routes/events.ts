import { Router } from 'express'
import { eventController } from '../controllers/events'
import { requireAuth } from '../middleware/auth'
import { createLimiter, deleteLimiter } from '../middleware/rateLimiter'

const router = Router()

// Apply auth middleware to all event routes
router.use(requireAuth)

// Get events for an application
router.get('/application/:applicationId', eventController.getByApplication)

// Create a new event for an application
router.post('/application/:applicationId', createLimiter, eventController.create)

// Delete an event
router.delete('/:id', deleteLimiter, eventController.delete)

export default router
