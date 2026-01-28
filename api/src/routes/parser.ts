import { Router } from 'express'
import { parserController } from '../controllers/parser'
import { requireAuth } from '../middleware/auth'
import { parserProtection } from '../middleware/rateLimiter'

const router = Router()

router.use(requireAuth)

// Parse job from URL (aggressively rate limited to prevent abuse - 5 req/min)
router.post('/parse', parserProtection, parserController.parseJob)

// Get supported job boards
router.get('/supported-sites', parserController.getSupportedSites)

export default router
