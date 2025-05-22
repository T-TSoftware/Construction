// src/routes/companyBalance.routes.ts
import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validateArrayBody } from "../middlewares/requestMiddleware";
import { stockSchema } from "../validations/validations";
import {
  postCompanyStockHandler,
  patchCompanyStockHandler,
  getCompanyStocksHandler,
  patchCompanyStocksHandler,
} from "../controllers/companyStock.controller";

const router = Router();

// 🛡 Tüm işlemler öncesinde kullanıcı doğrulaması
router.use(authMiddleware);

router.post("/", validateArrayBody(stockSchema), postCompanyStockHandler);

router.patch("/:code", patchCompanyStockHandler);
router.patch("/", patchCompanyStocksHandler);
router.get("/", getCompanyStocksHandler);
export default router;
