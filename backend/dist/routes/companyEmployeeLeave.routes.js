"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const companyEmployeeLeave_controller_1 = require("../controllers/companyEmployeeLeave.controller");
const requestValidation_1 = require("../middlewares/requestValidation");
const companyEmployeeLeave_validation_1 = require("../validations/companyEmployeeLeave.validation");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authMiddleware);
router.post("/:employeeId", (0, requestValidation_1.validate)(companyEmployeeLeave_validation_1.employeeLeaveCreateSchema), companyEmployeeLeave_controller_1.postCompanyEmployeeLeaveHandler);
router.patch("/:leaveId", (0, requestValidation_1.validate)(companyEmployeeLeave_validation_1.employeeLeaveUpdateSchema), companyEmployeeLeave_controller_1.patchCompanyEmployeeLeaveHandler);
router.get("/", companyEmployeeLeave_controller_1.getCompanyEmployeeLeavesHandler);
router.get("/employee/:employeeId", companyEmployeeLeave_controller_1.getCompanyEmployeeLeavesByEmployeeIdHandler);
router.get("/:leaveId", companyEmployeeLeave_controller_1.getCompanyEmployeeLeaveByIdHandler); // 👈 YENİ
router.delete("/:leaveId", companyEmployeeLeave_controller_1.deleteCompanyEmployeeLeaveHandler);
exports.default = router;
