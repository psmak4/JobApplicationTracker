import { Router } from 'express'
import { applicationController } from '../controllers/applications'
import { requireAuth } from '../middleware/auth'
import { createProtection, deleteProtection } from '../middleware/rateLimiter'

const router = Router()

// Apply auth middleware to all routes in this router
router.use(requireAuth)

router.get('/', applicationController.getAll)
router.get('/:id', applicationController.getOne)

router.post('/', createProtection, applicationController.create)
router.put('/:id', createProtection, applicationController.update)

router.delete('/:id', deleteProtection, applicationController.delete)

export default router
