"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/companyBalance.routes.ts
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const companyStock_controller_1 = require("../controllers/companyStock.controller");
const router = (0, express_1.Router)();
// 🛡 Tüm işlemler öncesinde kullanıcı doğrulaması
router.use(authMiddleware_1.authMiddleware);
router.post("/", companyStock_controller_1.postCompanyStockHandler);
router.patch("/:id", companyStock_controller_1.patchCompanyStockHandler);
router.get("/", companyStock_controller_1.getCompanyStocksHandler);
router.get("/:id", companyStock_controller_1.getCompanyStockByIdHandler);
exports.default = router;
