import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  postProjectQuantityHandler,
  getProjectQuantitiesHandler,
} from "../controllers/projectQuantity.controller";
import { validate } from "../middlewares/requestValidation";
import { projectQuantityCreateSchema } from "../validations/projectQuantity.validation";

const router = Router();

router.use(authMiddleware);

router.post(
  "/projects/:projectId/quantities",
  validate(projectQuantityCreateSchema),
  postProjectQuantityHandler
);

router.get("/projects/:projectId/quantities", getProjectQuantitiesHandler);

export default router;
