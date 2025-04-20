import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  postEstimatedCostHandler,
  getEstimatedCostsByProjectHandler,
} from "../controllers/projectEstimatedCost.controller";

const router = Router();

// 🛡 Tüm işlemler öncesinde kullanıcı doğrulaması
router.use(authMiddleware);

// ➕ Tahmini maliyet ekle
router.post("/projects/:projectId/estimated-costs", postEstimatedCostHandler);

router.get(
  "/projects/:projectId/estimated-costs",
  getEstimatedCostsByProjectHandler
);
export default router;
