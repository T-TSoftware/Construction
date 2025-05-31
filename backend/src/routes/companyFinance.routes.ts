import { Router } from "express";
import { postCompanyFinanceTransactionHandler } from "../controllers/companyFinance.controller";
import { authMiddleware } from "../middlewares/authMiddleware";

//import { validateFinanceArrayBody } from "../middlewares/validation.middleware";

const router = Router();

// 🛡 Tüm işlemler öncesinde kullanıcı doğrulaması
router.use(authMiddleware);

// 🔐 Only superadmin can post – validation + business logic
router.post(
  "/",
  /*validateFinanceArrayBody,*/ postCompanyFinanceTransactionHandler
);

export default router;
