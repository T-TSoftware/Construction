import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validateArrayBody } from "../middlewares/requestMiddleware";
import { supplierSchema } from "../validations/validations";
import {
  postProjectSupplierHandler,
  getProjectSuppliersHandler,
  patchProjectSupplierHandler,
  getProjectSupplierByIdHandler
} from "../controllers/projectSupplier.controller";

const router = Router();

router.use(authMiddleware);

router.post(
  "/projects/:projectId/suppliers",
  //validateArrayBody(supplierSchema),
  postProjectSupplierHandler
);

router.get("/projects/:projectId/suppliers", getProjectSuppliersHandler);

router.get("/supplier/:id", getProjectSupplierByIdHandler);
router.patch("/projects/suppliers/:id", patchProjectSupplierHandler);

export default router;
