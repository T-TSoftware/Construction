import { Router } from "express";
import { getBankMovementsHandler } from "../controllers/companyBankMovement.controller";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.get("/", getBankMovementsHandler);

export default router;