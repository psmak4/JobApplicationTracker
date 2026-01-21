import { Router } from "express";
import { statusController } from "../controllers/statuses";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

// Global status types
router.get("/types", statusController.getTypes);

// Application specific status history
router.get("/application/:applicationId", statusController.getByApplication);
router.post("/application/:applicationId", statusController.create);
router.delete("/:id", statusController.delete);

export default router;
