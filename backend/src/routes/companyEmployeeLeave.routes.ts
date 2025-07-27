import { Router } from "express";
import {
  validateBody,
  validateArrayBody,
} from "../middlewares/requestMiddleware";
import { authMiddleware } from "../middlewares/authMiddleware";

import {
  deleteCompanyEmployeeLeaveHandler,
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

router.get(
  "/employee/:employeeId",
  getCompanyEmployeeLeavesByEmployeeIdHandler
);
router.get("/:leaveId", getCompanyEmployeeLeaveByIdHandler); // 👈 YENİ
router.delete(
  "/:employeeId/leaves/:leaveId",
  deleteCompanyEmployeeLeaveHandler
);
export default router;
