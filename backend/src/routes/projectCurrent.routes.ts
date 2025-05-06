import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { postProjectCurrentHandler,getProjectCurrentsHandler } from "../controllers/projectCurrent.controller";

const router = Router();

router.use(authMiddleware);

router.post("/projects/:projectId/currents", postProjectCurrentHandler);

router.get("/projects/:projectId/currents", getProjectCurrentsHandler);

export default router;
