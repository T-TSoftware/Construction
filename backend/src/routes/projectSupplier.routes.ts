import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validateArrayBody } from "../middlewares/requestMiddleware";
import { supplierSchema } from "../validations/validations";
import {
  postProjectSupplierHandler,
  getProjectSuppliersHandler,
  patchProjectSupplierHandler,
} from "../controllers/projectSupplier.controller";

const router = Router();

router.use(authMiddleware);

router.post(
  "/projects/:projectId/suppliers",
  validateArrayBody(supplierSchema),
  postProjectSupplierHandler
);

router.get("/projects/:projectId/suppliers", getProjectSuppliersHandler);

router.patch("/projects/:projectId/suppliers", patchProjectSupplierHandler);

export default router;
