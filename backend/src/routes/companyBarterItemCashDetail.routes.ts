import { Router } from "express";
import {
  validateBody,
  validateArrayBody,
} from "../middlewares/requestMiddleware";
import { authMiddleware } from "../middlewares/authMiddleware";

import {
  postCompanyBarterCashDetailsHandler,
  getCompanyBarterCashDetailsByItemIdHandler,
  patchCompanyBarterCashDetailsHandler,
} from "../controllers/companyBarterItemCashDetail.controller";

const router = Router();

router.use(authMiddleware);

router.post(
  "/:barterItemId",
  /* validateBody, */ postCompanyBarterCashDetailsHandler
);

router.get("/:barterItemId", getCompanyBarterCashDetailsByItemIdHandler);

router.patch("/", patchCompanyBarterCashDetailsHandler);

export default router;
