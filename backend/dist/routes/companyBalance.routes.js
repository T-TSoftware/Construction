"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/companyBalance.routes.ts
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const companyBalance_controller_1 = require("../controllers/companyBalance.controller");
const requestValidation_1 = require("../middlewares/requestValidation");
const companyBalance_validation_1 = require("../validations/companyBalance.validation");
const router = (0, express_1.Router)();
// 🛡 Tüm işlemler öncesinde kullanıcı doğrulaması
router.use(authMiddleware_1.authMiddleware);
// 📌 GET → Tüm yetkili kullanıcılar
router.get("/", companyBalance_controller_1.getCompanyBalancesHandler);
// 📌 POST → Sadece super_admin
router.post("/", (0, requestValidation_1.validateArray)(companyBalance_validation_1.balanceCreateSchema), companyBalance_controller_1.postCompanyBalanceHandler);
// 📌 PUT → Sadece super_admin
router.put("/:id", (0, requestValidation_1.validate)(companyBalance_validation_1.balanceUpdateSchema), companyBalance_controller_1.putCompanyBalanceHandler);
router.put("/", (0, requestValidation_1.validateArray)(companyBalance_validation_1.balanceUpdateSchema), companyBalance_controller_1.putCompanyBalanceBulkHandler);
// 📌 DELETE → Sadece super_admin
router.delete("/:id", companyBalance_controller_1.deleteCompanyBalanceHandler);
exports.default = router;
