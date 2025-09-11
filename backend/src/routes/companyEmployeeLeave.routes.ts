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
  postCompanyEmployeeLeaveWEmployeeIdHandler,
} from "../controllers/companyEmployeeLeave.controller";
import { validate } from "../middlewares/requestValidation";
import {
  employeeLeaveCreateSchema,
  employeeLeaveCreateSchemaWEmployeeId,
  employeeLeaveUpdateSchema,
} from "../validations/companyEmployeeLeave.validation";

const router = Router();

router.use(authMiddleware);

router.post(
  "/:employeeId",
  validate(employeeLeaveCreateSchema),
  postCompanyEmployeeLeaveHandler
);

router.post(
  "/",
  validate(employeeLeaveCreateSchemaWEmployeeId),
  postCompanyEmployeeLeaveWEmployeeIdHandler
);

router.patch(
  "/:leaveId",
  validate(employeeLeaveUpdateSchema),
  patchCompanyEmployeeLeaveHandler
);

router.get("/", getCompanyEmployeeLeavesHandler);

router.get(
  "/employee/:employeeId",
  getCompanyEmployeeLeavesByEmployeeIdHandler
);
router.get("/:leaveId", getCompanyEmployeeLeaveByIdHandler); // 👈 YENİ
router.delete("/:leaveId", deleteCompanyEmployeeLeaveHandler);
export default router;
