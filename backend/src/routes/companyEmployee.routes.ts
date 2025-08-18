import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  postCompanyEmployeeHandler,
  getCompanyEmployeesHandler,
  getCompanyEmployeeByIdHandler,
  updateCompanyEmployeeUpdateHandler,
} from "../controllers/companyEmployee.controller";
import { validate } from "../middlewares/requestValidation";
import { employeeCreateSchema,employeeUpdateSchema } from "../validations/companyEmployee.validation";

const router = Router();

router.use(authMiddleware);

router.post("/", validate(employeeCreateSchema), postCompanyEmployeeHandler);

router.patch("/:id", validate(employeeUpdateSchema), updateCompanyEmployeeUpdateHandler);

router.get("/", /*validateBody,*/ getCompanyEmployeesHandler);

router.get("/:id", /*validateBody,*/ getCompanyEmployeeByIdHandler);

export default router;
