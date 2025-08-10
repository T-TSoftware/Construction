"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const projectSupplier_controller_1 = require("../controllers/projectSupplier.controller");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authMiddleware);
router.post("/projects/:projectId/suppliers", 
//validateArrayBody(supplierSchema),
projectSupplier_controller_1.postProjectSupplierHandler);
router.get("/projects/:projectId/suppliers", projectSupplier_controller_1.getProjectSuppliersHandler);
router.get("/supplier/:id", projectSupplier_controller_1.getProjectSupplierByIdHandler);
router.patch("/projects/suppliers/:id", projectSupplier_controller_1.patchProjectSupplierHandler);
exports.default = router;
