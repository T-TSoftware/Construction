import { Router } from "express";
import {
  postCompanyFinanceTransactionHandler,
  patchCompanyFinanceTransactionHandler,
  getCompanyFinanceTransactionsHandler,
  getCompanyFinanceTransactionByIdHandler,
} from "../controllers/companyFinance.controller";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  validateBody,
  validateArrayBody,
} from "../middlewares/requestMiddleware";
import { financeTransactionSchema } from "../validations/validations";

//import { validateFinanceArrayBody } from "../middlewares/validation.middleware";

const router = Router();

// 🛡 Tüm işlemler öncesinde kullanıcı doğrulaması
router.use(authMiddleware);

// 🔐 Only superadmin can post – validation + business logic
router.post(
  "/",
  validateArrayBody(financeTransactionSchema),
  /*validateFinanceArrayBody,*/ postCompanyFinanceTransactionHandler
);

router.patch(
  "/:id",
  /*validateFinanceArrayBody,*/ patchCompanyFinanceTransactionHandler
);

router.get("/", getCompanyFinanceTransactionsHandler);
router.get("/:id", getCompanyFinanceTransactionByIdHandler);
export default router;
