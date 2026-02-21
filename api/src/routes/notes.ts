import { Router } from 'express'
import { noteController } from '@/controllers/notes'
import { requireAuth } from '@/middleware/auth'
import { createLimiter, deleteLimiter } from '@/middleware/rateLimiter'

const router = Router()

// Apply auth middleware to all note routes
router.use(requireAuth)

// Get notes for an application
router.get('/application/:applicationId', noteController.getByApplication)

// Create a new note for an application
router.post('/application/:applicationId', createLimiter, noteController.create)

// Delete a note
router.delete('/:id', deleteLimiter, noteController.delete)

export default router
