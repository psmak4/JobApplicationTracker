import { Router } from 'express'
import { requireAdmin } from '../middleware/requireAdmin'

const router = Router()

// Apply admin auth middleware to all routes in this router
router.use(requireAdmin)

// Admin routes can be added here as needed

export default router
