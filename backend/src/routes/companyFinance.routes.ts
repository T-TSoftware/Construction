import { Router } from "express";
import {
  postCompanyFinanceTransactionHandler,
  patchCompanyFinanceTransactionHandler,
  getCompanyFinanceTransactionsHandler,
  getCompanyFinanceTransactionByIdHandler,
} from "../controllers/companyFinance.controller";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/requestValidation";
import {
  financeTransactionCreateSchema,
  financeTransactionUpdateSchema,
} from "../validations/companyFinanceTransaction.validation";

//import { validateFinanceArrayBody } from "../middlewares/validation.middleware";

const router = Router();

// 🛡 Tüm işlemler öncesinde kullanıcı doğrulaması
router.use(authMiddleware);

// 🔐 Only superadmin can post – validation + business logic
router.post(
  "/",
  validate(financeTransactionCreateSchema),
  postCompanyFinanceTransactionHandler
);

router.patch(
  "/:id",
  validate(financeTransactionUpdateSchema),
  patchCompanyFinanceTransactionHandler
);

router.get("/", getCompanyFinanceTransactionsHandler);
router.get("/:id", getCompanyFinanceTransactionByIdHandler);
export default router;
