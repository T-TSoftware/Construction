import { Router } from "express";
import {
  postCompanyChecksHandler,
  patchCompanyCheckHandler,
} from "../controllers/companyCheck.controller";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  validateBody,
  validateArrayBody,
} from "../middlewares/requestMiddleware";
import { checkSchema } from "../validations/validations";

//import { validateFinanceArrayBody } from "../middlewares/validation.middleware";

const router = Router();

// 🛡 Tüm işlemler öncesinde kullanıcı doğrulaması
router.use(authMiddleware);

// 🔐 Only superadmin can post – validation + business logic
router.post(
  "/",
  validateArrayBody(checkSchema("create")),
  postCompanyChecksHandler
);
router.patch(
  "/:code",
  validateBody(checkSchema("update")),
  patchCompanyCheckHandler
);

export default router;
