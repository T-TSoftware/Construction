// src/routes/companyBalance.routes.ts
import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { getProjectCostSummaryHandler } from "../controllers/projectCostSummary.controller";

const router = Router();

// 🛡 Tüm işlemler öncesinde kullanıcı doğrulaması
router.use(authMiddleware);

// 📌 GET → Tüm yetkili kullanıcılar
router.get("/projects/:projectId/costsummary", getProjectCostSummaryHandler);

export default router;
