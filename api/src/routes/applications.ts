import { Router } from 'express'
import { applicationController } from '../controllers/applications'
import { requireAuth } from '../middleware/auth'
import { createProtection, deleteProtection } from '../middleware/rateLimiter'
import { validateUUID } from '../middleware/validateParams'

const router = Router()

// Apply auth middleware to all routes in this router
router.use(requireAuth)

router.get('/list', applicationController.getList)
router.get('/active', applicationController.getActiveList)
router.get('/:id', validateUUID('id'), applicationController.getOne)

router.post('/', createProtection, applicationController.create)
router.put('/:id', createProtection, validateUUID('id'), applicationController.update)

router.delete('/:id', deleteProtection, validateUUID('id'), applicationController.delete)

export default router
