"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const companyFinance_controller_1 = require("../controllers/companyFinance.controller");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const requestValidation_1 = require("../middlewares/requestValidation");
const companyFinanceTransaction_validation_1 = require("../validations/companyFinanceTransaction.validation");
//import { validateFinanceArrayBody } from "../middlewares/validation.middleware";
const router = (0, express_1.Router)();
// 🛡 Tüm işlemler öncesinde kullanıcı doğrulaması
router.use(authMiddleware_1.authMiddleware);
// 🔐 Only superadmin can post – validation + business logic
router.post("/", (0, requestValidation_1.validate)(companyFinanceTransaction_validation_1.financeTransactionCreateSchema), companyFinance_controller_1.postCompanyFinanceTransactionHandler);
router.patch("/:id", (0, requestValidation_1.validate)(companyFinanceTransaction_validation_1.financeTransactionUpdateSchema), companyFinance_controller_1.patchCompanyFinanceTransactionHandler);
router.get("/", companyFinance_controller_1.getCompanyFinanceTransactionsHandler);
router.get("/:id", companyFinance_controller_1.getCompanyFinanceTransactionByIdHandler);
router.delete("/:id", companyFinance_controller_1.deleteCompanyFinanceTransactionByIdHandler);
exports.default = router;
