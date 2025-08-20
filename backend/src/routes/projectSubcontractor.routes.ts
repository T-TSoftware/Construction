import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  postProjectSubcontractorHandler,
  getProjectSubcontractorsHandler,
  patchProjectSubcontractorHandler,
  getProjectSubcontractorByIdHandler,
} from "../controllers/projectSubcontractor.controller";

import { validate } from "../middlewares/requestValidation";
import {
  subcontractorCreateSchema,
  subcontractorUpdateSchema,
} from "../validations/projectSubcontractor.validation";

const router = Router();

router.use(authMiddleware);

router.post(
  "/projects/:projectId/subcontractors",
  validate(subcontractorCreateSchema),
  postProjectSubcontractorHandler
);

router.get(
  "/projects/:projectId/subcontractors",
  getProjectSubcontractorsHandler
);
router.get("/subcontractor/:id", getProjectSubcontractorByIdHandler);

router.patch(
  "/projects/subcontractors/:id",
  validate(subcontractorUpdateSchema),
  patchProjectSubcontractorHandler
);

export default router;
