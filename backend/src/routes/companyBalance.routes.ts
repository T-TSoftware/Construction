// src/routes/companyBalance.routes.ts
import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  getCompanyBalancesHandler,
  postCompanyBalanceHandler,
  putCompanyBalanceHandler,
  deleteCompanyBalanceHandler,
} from "../controllers/companyBalance.controller";

const router = Router();

// 🛡 Tüm işlemler öncesinde kullanıcı doğrulaması
router.use(authMiddleware);

// 📌 GET → Tüm yetkili kullanıcılar
router.get("/", getCompanyBalancesHandler);

// 📌 POST → Sadece super_admin
router.post("/", postCompanyBalanceHandler);

// 📌 PUT → Sadece super_admin
router.put("/:id", putCompanyBalanceHandler);

// 📌 DELETE → Sadece super_admin
router.delete("/:id", deleteCompanyBalanceHandler);

export default router;
