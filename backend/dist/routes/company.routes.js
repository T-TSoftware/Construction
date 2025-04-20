"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const company_controller_1 = require("../controllers/company.controller");
const router = (0, express_1.Router)();
// Tüm şirketleri getir
router.get("/", company_controller_1.getCompanies);
// Belirli bir şirketi getir (ID ile)
router.get("/:id", company_controller_1.getCompany);
// Yeni şirket oluştur
router.post('/', company_controller_1.postCompany);
// Şirket bilgisi güncelle (ID ile)
//router.put('/:id', putCompany);
// Şirket sil (ID ile)
//router.delete('/:id', removeCompany);
exports.default = router;
