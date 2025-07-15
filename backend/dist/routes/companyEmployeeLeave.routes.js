"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const companyEmployeeLeave_controller_1 = require("../controllers/companyEmployeeLeave.controller");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authMiddleware);
router.post("/:employeeId", 
/* validateBody, */ companyEmployeeLeave_controller_1.postCompanyEmployeeLeaveHandler);
router.patch("/:leaveId", companyEmployeeLeave_controller_1.patchCompanyEmployeeLeaveHandler);
router.get("/", companyEmployeeLeave_controller_1.getCompanyEmployeeLeavesHandler);
router.get("/:employeeId", companyEmployeeLeave_controller_1.getCompanyEmployeeLeavesByEmployeeIdHandler);
router.get("/:employeeId/leaves/:leaveId", companyEmployeeLeave_controller_1.getCompanyEmployeeLeaveByIdHandler); // 👈 YENİ
router.delete("/:employeeId/leaves/:leaveId", companyEmployeeLeave_controller_1.deleteCompanyEmployeeLeaveHandler);
exports.default = router;
