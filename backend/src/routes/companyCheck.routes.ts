import { Router } from "express";
import { postCompanyChecksHandler } from "../controllers/companyCheck.controller";
import { authMiddleware } from "../middlewares/authMiddleware";

//import { validateFinanceArrayBody } from "../middlewares/validation.middleware";

const router = Router();

// 🛡 Tüm işlemler öncesinde kullanıcı doğrulaması
router.use(authMiddleware);

// 🔐 Only superadmin can post – validation + business logic
router.post("/", /*validateFinanceArrayBody,*/ postCompanyChecksHandler);

export default router;
