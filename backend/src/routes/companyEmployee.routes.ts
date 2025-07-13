import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  postCompanyEmployeeHandler,
  getCompanyEmployeesHandler,
  getCompanyEmployeeByIdHandler,
  updateCompanyEmployeeUpdateHandler,
} from "../controllers/companyEmployee.controller";
import {
  validateBody,
  validateArrayBody,
} from "../middlewares/requestMiddleware";
import { getCompanyEmployees } from "../services/companyEmployee.service";

const router = Router();

router.use(authMiddleware);

router.post("/", /*validateBody,*/ postCompanyEmployeeHandler);

router.patch("/:id", /*validateBody,*/ updateCompanyEmployeeUpdateHandler);

router.get("/", /*validateBody,*/ getCompanyEmployeesHandler);

router.get("/:id", /*validateBody,*/ getCompanyEmployeeByIdHandler);

export default router;
