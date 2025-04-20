import { Router } from "express";
import {
  getCompanies,
  getCompany,
  postCompany,
  putCompany,
  removeCompany,
} from "../controllers/company.controller";

const router = Router();

// Tüm şirketleri getir
router.get("/", getCompanies);

// Belirli bir şirketi getir (ID ile)
router.get("/:id", getCompany);

// Yeni şirket oluştur
router.post('/', postCompany);

// Şirket bilgisi güncelle (ID ile)
//router.put('/:id', putCompany);

// Şirket sil (ID ile)
//router.delete('/:id', removeCompany);

export default router;
