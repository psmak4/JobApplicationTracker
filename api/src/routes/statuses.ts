import { Router } from 'express'
import { statusController } from '../controllers/statuses'
import { requireAuth } from '../middleware/auth'
import { createProtection, deleteProtection } from '../middleware/rateLimiter'

const router = Router()

router.use(requireAuth)

router.get('/types', statusController.getTypes)
router.get('/application/:applicationId', statusController.getByApplication)

router.post('/application/:applicationId', createProtection, statusController.create)

router.delete('/:id', deleteProtection, statusController.delete)

export default router
