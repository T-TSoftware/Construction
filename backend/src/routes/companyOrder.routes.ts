import { Router } from "express";
import { validateBody } from "../middlewares/requestMiddleware";
import { authMiddleware } from "../middlewares/authMiddleware";
import { postCompanyOrderHandler } from "../controllers/companyOrder.controller";

const router = Router();

router.use(authMiddleware);

router.post("/", /*validateBody,*/ postCompanyOrderHandler);
export default router;
