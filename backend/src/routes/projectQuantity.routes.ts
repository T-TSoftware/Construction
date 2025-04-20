import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  postProjectQuantityHandler,
  getProjectQuantitiesHandler,
} from "../controllers/projectQuantity.controller";

const router = Router();

router.use(authMiddleware);

router.post("/projects/:projectId/quantities", postProjectQuantityHandler);

router.get("/projects/:projectId/quantities", getProjectQuantitiesHandler);

export default router;
