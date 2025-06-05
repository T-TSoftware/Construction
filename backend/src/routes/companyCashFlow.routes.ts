import { Router } from "express";
import { getDailyCashflowHandler } from "../controllers/companyCashFlow.controller";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.get("/", getDailyCashflowHandler);

export default router;
