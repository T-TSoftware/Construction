"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const companyFinance_controller_1 = require("../controllers/companyFinance.controller");
const authMiddleware_1 = require("../middlewares/authMiddleware");
//import { validateFinanceArrayBody } from "../middlewares/validation.middleware";
const router = (0, express_1.Router)();
// 🛡 Tüm işlemler öncesinde kullanıcı doğrulaması
router.use(authMiddleware_1.authMiddleware);
// 🔐 Only superadmin can post – validation + business logic
router.post("/", 
/*validateFinanceArrayBody,*/ companyFinance_controller_1.postCompanyFinanceTransactionHandler);
exports.default = router;
