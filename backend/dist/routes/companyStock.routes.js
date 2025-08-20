"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/companyBalance.routes.ts
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const requestValidation_1 = require("../middlewares/requestValidation");
const companyStock_validation_1 = require("../validations/companyStock.validation");
const companyStock_controller_1 = require("../controllers/companyStock.controller");
const router = (0, express_1.Router)();
// 🛡 Tüm işlemler öncesinde kullanıcı doğrulaması
router.use(authMiddleware_1.authMiddleware);
router.post("/", (0, requestValidation_1.validate)(companyStock_validation_1.stockCreateSchema), companyStock_controller_1.postCompanyStockHandler);
router.patch("/:id", (0, requestValidation_1.validate)(companyStock_validation_1.stockUpdateSchema), companyStock_controller_1.patchCompanyStockHandler);
router.get("/", companyStock_controller_1.getCompanyStocksHandler);
router.get("/project/:projectId", companyStock_controller_1.getProjectStocksByProjectIdHandler);
router.get("/:id", companyStock_controller_1.getCompanyStockByIdHandler);
exports.default = router;
