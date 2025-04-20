import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  postProjectSubcontractorHandler,
  getProjectSubcontractorsHandler,
  patchProjectSubcontractorHandler,
} from "../controllers/projectSubcontractor.controller";

const router = Router();

router.use(authMiddleware);

router.post(
  "/projects/:projectId/subcontractors",
  postProjectSubcontractorHandler
);

router.get(
  "/projects/:projectId/subcontractors",
  getProjectSubcontractorsHandler
);

router.patch(
  "/projects/:projectId/subcontractors/:code",
  patchProjectSubcontractorHandler
);

export default router;
