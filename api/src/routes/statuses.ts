import { Router } from 'express'
import { statusController } from '../controllers/statuses'
import { requireAuth } from '../middleware/auth'
import { createProtection, deleteProtection } from '../middleware/rateLimiter'
import { validateUUID } from '../middleware/validateParams'

const router = Router()

router.use(requireAuth)

router.get('/types', statusController.getTypes)
router.get('/application/:applicationId', validateUUID('applicationId'), statusController.getByApplication)

router.post('/application/:applicationId', createProtection, validateUUID('applicationId'), statusController.create)
router.patch('/:id', createProtection, validateUUID('id'), statusController.update)

router.delete('/:id', deleteProtection, validateUUID('id'), statusController.delete)

export default router
