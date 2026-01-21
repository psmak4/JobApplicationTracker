import { Router } from "express";
import { applicationController } from "../controllers/applications";
import { requireAuth } from "../middleware/auth";

const router = Router();

// Apply auth middleware to all routes in this router
router.use(requireAuth);

router.get("/", applicationController.getAll);
router.post("/", applicationController.create);
router.get("/:id", applicationController.getOne);
router.put("/:id", applicationController.update);
router.delete("/:id", applicationController.delete);

export default router;
