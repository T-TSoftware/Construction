import { Router } from "express";
import { getCurrentMovementsHandler } from "../controllers/companyCurrentMovement.controller";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.get("/", getCurrentMovementsHandler);

export default router;
