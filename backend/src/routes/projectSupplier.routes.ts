import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validateSupplierArrayBody } from "../middlewares/requestMiddleware";
import {
  postProjectSupplierHandler,
  getProjectSuppliersHandler,
  patchProjectSupplierHandler,
} from "../controllers/projectSupplier.controller";

const router = Router();

router.use(authMiddleware);

router.post(
  "/projects/:projectId/suppliers",
  validateSupplierArrayBody,
  postProjectSupplierHandler
);

router.get("/projects/:projectId/suppliers", getProjectSuppliersHandler);

router.patch(
  "/projects/:projectId/suppliers/:code",
  patchProjectSupplierHandler
);

export default router;
