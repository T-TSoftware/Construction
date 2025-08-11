import { Router } from "express";
import {
  postCompanyCheckHandler,
  patchCompanyCheckHandler,
  getCompanyChecksHandler,
  getCompanyCheckByIdHandler,
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
  //validateArrayBody(checkSchema("create")),
  postCompanyCheckHandler
);
router.patch(
  "/:id",
  //validateBody(checkSchema("update")),
  patchCompanyCheckHandler
);

router.get("/", getCompanyChecksHandler);

router.get("/:id", getCompanyCheckByIdHandler);

export default router;
