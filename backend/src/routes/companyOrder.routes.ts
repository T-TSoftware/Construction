import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/requestValidation";
import { orderCreateSchema } from "../validations/companyOrder.validation";
import {
  getCompanyOrderByIdHandler,
  getCompanyOrdersHandler,
  postCompanyOrderHandler,
  getCompanyOrdersByProjectIdHandler,
} from "../controllers/companyOrder.controller";

const router = Router();

router.use(authMiddleware);

router.post("/", validate(orderCreateSchema), postCompanyOrderHandler);

router.get("/", getCompanyOrdersHandler);

router.get("/:id", getCompanyOrderByIdHandler);

router.get("/project/:projectId", getCompanyOrdersByProjectIdHandler);

export default router;
