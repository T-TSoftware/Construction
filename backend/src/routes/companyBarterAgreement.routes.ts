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

const router = Router();

router.use(authMiddleware);

router.post("/", /*validateBody,*/ postCompanyBarterAgreementHandler);

router.post(
  "/projects/:projectId/barters",
  /*validateArrayBody(baterSchema),*/
  postCompanyBarterAgreementFromProjectHandler
);

router.patch("/:id", patchCompanyBarterAgreementHandler);

router.get("/:id", getCompanyBarterAgreementByIdHandler);

router.get("/", getAllCompanyBarterAgreementsHandler);

router.get("/:projectId", getAllCompanyBarterAgreementsByProjectIdHandler);

export default router;
