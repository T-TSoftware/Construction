import { Router } from "express";
import {
  getUpcomingCollectionsHandler,
  getUpcomingPaymentsHandler,
} from "../controllers/companyUpcomingTransaction.controller";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.get("/collections", getUpcomingCollectionsHandler);

router.get("/payments", getUpcomingPaymentsHandler);

export default router;
