"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/companyBalance.routes.ts
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const projectCostSummary_controller_1 = require("../controllers/projectCostSummary.controller");
const router = (0, express_1.Router)();
// 🛡 Tüm işlemler öncesinde kullanıcı doğrulaması
router.use(authMiddleware_1.authMiddleware);
// 📌 GET → Tüm yetkili kullanıcılar
router.get("/projects/:projectId/costsummary", projectCostSummary_controller_1.getProjectCostSummaryHandler);
exports.default = router;
