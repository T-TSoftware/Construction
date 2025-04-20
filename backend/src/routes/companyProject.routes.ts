// src/routes/companyBalance.routes.ts
import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  postCompanyProjectHandler,
  getCompanyProjectsHandler,
  getProjectByIdHandler,
} from "../controllers/companyProject.controller";

const router = Router();

// 🛡 Tüm işlemler öncesinde kullanıcı doğrulaması
router.use(authMiddleware);

router.post("/", postCompanyProjectHandler);
router.get("/", getCompanyProjectsHandler);
router.get("/:id", getProjectByIdHandler);

export default router;
