"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/companyBalance.routes.ts
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const companyProject_controller_1 = require("../controllers/companyProject.controller");
const router = (0, express_1.Router)();
// 🛡 Tüm işlemler öncesinde kullanıcı doğrulaması
router.use(authMiddleware_1.authMiddleware);
router.post("/", companyProject_controller_1.postCompanyProjectHandler);
router.get("/", companyProject_controller_1.getCompanyProjectsHandler);
router.get("/:id", companyProject_controller_1.getProjectByIdHandler);
exports.default = router;
