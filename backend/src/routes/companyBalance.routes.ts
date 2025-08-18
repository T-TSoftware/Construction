// src/routes/companyBalance.routes.ts
import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  getCompanyBalancesHandler,
  postCompanyBalanceHandler,
  putCompanyBalanceHandler,
  deleteCompanyBalanceHandler,
} from "../controllers/companyBalance.controller";
import { validate } from "../middlewares/requestValidation";
import {
  balanceCreateSchema,
  balanceUpdateSchema,
} from "../validations/companyBalance.validation";

const router = Router();

// 🛡 Tüm işlemler öncesinde kullanıcı doğrulaması
router.use(authMiddleware);

// 📌 GET → Tüm yetkili kullanıcılar
router.get("/", getCompanyBalancesHandler);

// 📌 POST → Sadece super_admin
router.post("/", validate(balanceCreateSchema), postCompanyBalanceHandler);

// 📌 PUT → Sadece super_admin
router.put("/:id", validate(balanceUpdateSchema), putCompanyBalanceHandler);

// 📌 DELETE → Sadece super_admin
router.delete("/:id", deleteCompanyBalanceHandler);

export default router;
