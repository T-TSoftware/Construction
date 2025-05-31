"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/companyBalance.routes.ts
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const requestMiddleware_1 = require("../middlewares/requestMiddleware");
const validations_1 = require("../validations/validations");
const companyStock_controller_1 = require("../controllers/companyStock.controller");
const router = (0, express_1.Router)();
// 🛡 Tüm işlemler öncesinde kullanıcı doğrulaması
router.use(authMiddleware_1.authMiddleware);
router.post("/", (0, requestMiddleware_1.validateArrayBody)(validations_1.stockSchema), companyStock_controller_1.postCompanyStockHandler);
router.patch("/:code", companyStock_controller_1.patchCompanyStockHandler);
router.patch("/", companyStock_controller_1.patchCompanyStocksHandler);
router.get("/", companyStock_controller_1.getCompanyStocksHandler);
exports.default = router;
