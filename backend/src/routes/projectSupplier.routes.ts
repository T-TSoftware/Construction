import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  postProjectSupplierHandler,
  getProjectSuppliersHandler,
  patchProjectSupplierHandler,
} from "../controllers/projectSupplier.controller";

const router = Router();

router.use(authMiddleware);

router.post("/projects/:projectId/suppliers", postProjectSupplierHandler);

router.get("/projects/:projectId/suppliers", getProjectSuppliersHandler);

router.patch(
  "/projects/:projectId/suppliers/:code",
  patchProjectSupplierHandler
);

export default router;
