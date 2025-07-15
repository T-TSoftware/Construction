"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const companyLoanPayment_controller_1 = require("../controllers/companyLoanPayment.controller");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authMiddleware);
// GET → Tüm taksit ödemeleri
router.get("/", companyLoanPayment_controller_1.getCompanyLoanPaymentsHandler);
// GET → Belirli bir taksit ödemesi
router.get("/:id", companyLoanPayment_controller_1.getCompanyLoanPaymentByIdHandler);
// POST → Yeni taksit kaydı (loanId route paramı olarak kullanılabilir)
router.post("/:loanId", /* validateBody, */ companyLoanPayment_controller_1.postCompanyLoanPaymentHandler);
router.patch("/:id", companyLoanPayment_controller_1.patchCompanyLoanPaymentHandler);
router.get("/loanpayments/export/csv", companyLoanPayment_controller_1.exportLoanPaymentsHandler);
router.get("/loanpayments/export/pdf", companyLoanPayment_controller_1.exportLoanPaymentsPdfHandler);
exports.default = router;
