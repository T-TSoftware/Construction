import { Router } from "express";
import {
  validateBody,
  validateArrayBody,
} from "../middlewares/requestMiddleware";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  postCompanyLoanPaymentHandler,
  getCompanyLoanPaymentByIdHandler,
  getCompanyLoanPaymentsHandler,
  patchCompanyLoanPaymentHandler,
  getCompanyLoanPaymentsByLoanIdHandler,
  exportLoanPaymentsHandler,
  exportLoanPaymentsPdfHandler,
} from "../controllers/companyLoanPayment.controller";

import { validate, validateArray } from "../middlewares/requestValidation";
import {
  loanPaymentCreateSchema,
  loanPaymentUpdateSchema,
} from "../validations/companyLoanPayment.validation";

const router = Router();

router.use(authMiddleware);

// GET → Tüm taksit ödemeleri
router.get("/", getCompanyLoanPaymentsHandler);

// GET → Belirli bir taksit ödemesi
router.get("/:id", getCompanyLoanPaymentByIdHandler);

// POST → Yeni taksit kaydı (loanId route paramı olarak kullanılabilir)
router.post(
  "/:loanId",
  validateArray(loanPaymentCreateSchema),
  postCompanyLoanPaymentHandler
);

router.patch(
  "/:id",
  validate(loanPaymentUpdateSchema),
  patchCompanyLoanPaymentHandler
);

router.get("/loan/:loanId", getCompanyLoanPaymentsByLoanIdHandler);

router.get("/loanpayments/export/csv", exportLoanPaymentsHandler);

router.get("/loanpayments/export/pdf", exportLoanPaymentsPdfHandler);

export default router;
