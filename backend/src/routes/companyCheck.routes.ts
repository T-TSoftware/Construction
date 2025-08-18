import { Router } from "express";
import {
  postCompanyCheckHandler,
  patchCompanyCheckHandler,
  getCompanyChecksHandler,
  getCompanyCheckByIdHandler,
} from "../controllers/companyCheck.controller";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/requestValidation";
import { checkCreateSchema,checkUpdateSchema } from "../validations/companyCheck.validation";

//import { validateFinanceArrayBody } from "../middlewares/validation.middleware";

const router = Router();

// 🛡 Tüm işlemler öncesinde kullanıcı doğrulaması
router.use(authMiddleware);

// 🔐 Only superadmin can post – validation + business logic
router.post(
  "/",
  validate(checkCreateSchema),
  postCompanyCheckHandler
);
router.patch(
  "/:id",
  validate(checkUpdateSchema),
  patchCompanyCheckHandler
);

router.get("/", getCompanyChecksHandler);

router.get("/:id", getCompanyCheckByIdHandler);

export default router;
