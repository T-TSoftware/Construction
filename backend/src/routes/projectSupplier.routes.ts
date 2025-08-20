import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/requestValidation";
import { projectSupplierCreateSchema,projectSupplierUpdateSchema } from "../validations/projectSupplier.validation";
import {
  postProjectSupplierHandler,
  getProjectSuppliersHandler,
  patchProjectSupplierHandler,
  getProjectSupplierByIdHandler,
} from "../controllers/projectSupplier.controller";

const router = Router();

router.use(authMiddleware);

router.post(
  "/projects/:projectId/suppliers",
  validate(projectSupplierCreateSchema),
  postProjectSupplierHandler
);

router.get("/projects/:projectId/suppliers", getProjectSuppliersHandler);

router.get("/supplier/:id", getProjectSupplierByIdHandler);
router.patch("/projects/suppliers/:id",validate(projectSupplierUpdateSchema), patchProjectSupplierHandler);

export default router;
