// src/routes/companyBalance.routes.ts
import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validateArrayBody } from "../middlewares/requestMiddleware";
import { stockSchema } from "../validations/validations";
import {
  postCompanyStockHandler,
  patchCompanyStockHandler,
  getCompanyStocksHandler,
  getCompanyStockByIdHandler,
} from "../controllers/companyStock.controller";

const router = Router();

// 🛡 Tüm işlemler öncesinde kullanıcı doğrulaması
router.use(authMiddleware);

router.post("/", postCompanyStockHandler);

router.patch("/:id", patchCompanyStockHandler);
router.get("/", getCompanyStocksHandler);
router.get("/:id", getCompanyStockByIdHandler);
export default router;
