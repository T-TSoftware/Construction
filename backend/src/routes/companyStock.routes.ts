// src/routes/companyBalance.routes.ts
import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validateArrayBody } from "../middlewares/requestMiddleware";
import { stockSchema } from "../validations/validations";
import {
  postCompanyStockHandler,
  patchCompanyStockHandler,
  getCompanyStocksHandler,
} from "../controllers/companyStock.controller";

const router = Router();

// 🛡 Tüm işlemler öncesinde kullanıcı doğrulaması
router.use(authMiddleware);

router.post("/", validateArrayBody(stockSchema), postCompanyStockHandler);

router.patch("/:code", patchCompanyStockHandler);

router.get("/", getCompanyStocksHandler);
export default router;
