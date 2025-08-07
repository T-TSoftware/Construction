"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const companyFinance_controller_1 = require("../controllers/companyFinance.controller");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const requestMiddleware_1 = require("../middlewares/requestMiddleware");
const validations_1 = require("../validations/validations");
//import { validateFinanceArrayBody } from "../middlewares/validation.middleware";
const router = (0, express_1.Router)();
// 🛡 Tüm işlemler öncesinde kullanıcı doğrulaması
router.use(authMiddleware_1.authMiddleware);
// 🔐 Only superadmin can post – validation + business logic
router.post("/", (0, requestMiddleware_1.validateArrayBody)(validations_1.financeTransactionSchema), 
/*validateFinanceArrayBody,*/ companyFinance_controller_1.postCompanyFinanceTransactionHandler);
router.patch("/:id", 
/*validateFinanceArrayBody,*/ companyFinance_controller_1.patchCompanyFinanceTransactionHandler);
router.get("/", companyFinance_controller_1.getCompanyFinanceTransactionsHandler);
router.get("/:id", companyFinance_controller_1.getCompanyFinanceTransactionByIdHandler);
exports.default = router;
