"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/companyBalance.routes.ts
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const companyBalance_controller_1 = require("../controllers/companyBalance.controller");
const router = (0, express_1.Router)();
// 🛡 Tüm işlemler öncesinde kullanıcı doğrulaması
router.use(authMiddleware_1.authMiddleware);
// 📌 GET → Tüm yetkili kullanıcılar
router.get("/", companyBalance_controller_1.getCompanyBalancesHandler);
// 📌 POST → Sadece super_admin
router.post("/", companyBalance_controller_1.postCompanyBalanceHandler);
// 📌 PUT → Sadece super_admin
router.put("/:id", companyBalance_controller_1.putCompanyBalanceHandler);
// 📌 DELETE → Sadece super_admin
router.delete("/:id", companyBalance_controller_1.deleteCompanyBalanceHandler);
exports.default = router;
