import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  postCompanyBarterAgreementItemHandler,
  getAllCompanyBarterAgreementItemsHandler,
  getCompanyBarterAgreementItemByIdHandler,
  getCompanyBarterAgreementItemsByAgreementIdHandler,
} from "../controllers/companyBarterAgreementItem.controller";
import {
  validateBody,
  validateArrayBody,
} from "../middlewares/requestMiddleware";
import { validate } from "../middlewares/requestValidation";
import { barterAgreementItemCreateSchema } from "../validations/companyBarterAgreementItem.validation";

const router = Router();

router.use(authMiddleware);

// 1. Belirli bir item'a ulaşma (en spesifik route en üstte olmalı)
router.get("/:itemId", getCompanyBarterAgreementItemByIdHandler);

// 2. Belirli bir barterAgreement'a ait tüm item'lar
router.get("/barter/:barterId", getCompanyBarterAgreementItemsByAgreementIdHandler);

// 3. Tüm item'lar (şirket bazlı)
router.get("/", getAllCompanyBarterAgreementItemsHandler);

// 4. Yeni item ekleme
router.post(
  "/:barterId",
  /*validateBody,*/ validate(barterAgreementItemCreateSchema),postCompanyBarterAgreementItemHandler
);

export default router;