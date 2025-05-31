"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const projectEstimatedCost_controller_1 = require("../controllers/projectEstimatedCost.controller");
const router = (0, express_1.Router)();
// 🛡 Tüm işlemler öncesinde kullanıcı doğrulaması
router.use(authMiddleware_1.authMiddleware);
// ➕ Tahmini maliyet ekle
router.post("/projects/:projectId/estimated-costs", projectEstimatedCost_controller_1.postEstimatedCostHandler);
router.get("/projects/:projectId/estimated-costs", projectEstimatedCost_controller_1.getEstimatedCostsByProjectHandler);
exports.default = router;
