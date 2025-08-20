// src/routes/companyBalance.routes.ts
import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/requestValidation";
import {
  stockCreateSchema,
  stockUpdateSchema,
} from "../validations/companyStock.validation";
import {
  postCompanyStockHandler,
  patchCompanyStockHandler,
  getCompanyStocksHandler,
  getCompanyStockByIdHandler,
  getProjectStocksByProjectIdHandler,
} from "../controllers/companyStock.controller";

const router = Router();

// 🛡 Tüm işlemler öncesinde kullanıcı doğrulaması
router.use(authMiddleware);

router.post("/", validate(stockCreateSchema), postCompanyStockHandler);

router.patch("/:id", validate(stockUpdateSchema), patchCompanyStockHandler);
router.get("/", getCompanyStocksHandler);
router.get("/project/:projectId", getProjectStocksByProjectIdHandler);
router.get("/:id", getCompanyStockByIdHandler);
export default router;
