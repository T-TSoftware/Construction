import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  postCompanyBarterAgreementHandler,
  postCompanyBarterAgreementFromProjectHandler,
  getCompanyBarterAgreementByIdHandler,
  getAllCompanyBarterAgreementsHandler,
  getAllCompanyBarterAgreementsByProjectIdHandler,
  patchCompanyBarterAgreementHandler,
} from "../controllers/companyBarterAgreement.controller";
import {
  validateBody,
  validateArrayBody,
} from "../middlewares/requestMiddleware";
import { validate } from "../middlewares/requestValidation";
import {
  barterCreateSchema,
  barterUpdateSchema,
} from "../validations/companyBarterAgreement.validation";

const router = Router();

router.use(authMiddleware);

router.post(
  "/",
  validate(barterCreateSchema),
  postCompanyBarterAgreementHandler
);

router.post(
  "/projects/:projectId",
  validate(barterCreateSchema),
  postCompanyBarterAgreementFromProjectHandler
);

router.patch(
  "/:id",
  validate(barterUpdateSchema),
  patchCompanyBarterAgreementHandler
);

router.get("/:id", getCompanyBarterAgreementByIdHandler);

router.get("/", getAllCompanyBarterAgreementsHandler);

router.get(
  "/project/:projectId",
  getAllCompanyBarterAgreementsByProjectIdHandler
);

export default router;
