import { Router } from "express";
import { validateBody } from "../middlewares/requestMiddleware";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  getCompanyOrderByIdHandler,
  getCompanyOrdersHandler,
  postCompanyOrderHandler,
} from "../controllers/companyOrder.controller";

const router = Router();

router.use(authMiddleware);

router.post("/", /*validateBody,*/ postCompanyOrderHandler);

router.get("/", getCompanyOrdersHandler);

router.get("/:id", getCompanyOrderByIdHandler);

export default router;
