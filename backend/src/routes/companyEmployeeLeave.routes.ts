import { Router } from "express";
import {
  validateBody,
  validateArrayBody,
} from "../middlewares/requestMiddleware";
import { authMiddleware } from "../middlewares/authMiddleware";

import {
  getCompanyEmployeeLeaveByIdHandler,
  getCompanyEmployeeLeavesByEmployeeIdHandler,
  getCompanyEmployeeLeavesHandler,
  patchCompanyEmployeeLeaveHandler,
  postCompanyEmployeeLeaveHandler,
} from "../controllers/companyEmployeeLeave.controller";

const router = Router();

router.use(authMiddleware);

router.post(
  "/:employeeId",
  /* validateBody, */ postCompanyEmployeeLeaveHandler
);

router.patch("/:leaveId", patchCompanyEmployeeLeaveHandler);

router.get("/", getCompanyEmployeeLeavesHandler);

router.get("/:employeeId", getCompanyEmployeeLeavesByEmployeeIdHandler);
router.get("/:employeeId/leaves/:leaveId", getCompanyEmployeeLeaveByIdHandler); // 👈 YENİ
export default router;
