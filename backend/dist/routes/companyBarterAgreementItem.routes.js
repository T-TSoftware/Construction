"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const companyBarterAgreementItem_controller_1 = require("../controllers/companyBarterAgreementItem.controller");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authMiddleware);
// 1. Belirli bir item'a ulaşma (en spesifik route en üstte olmalı)
router.get("/:itemId", companyBarterAgreementItem_controller_1.getCompanyBarterAgreementItemByIdHandler);
// 2. Belirli bir barterAgreement'a ait tüm item'lar
router.get("/barter/:barterId", companyBarterAgreementItem_controller_1.getCompanyBarterAgreementItemsByAgreementIdHandler);
// 3. Tüm item'lar (şirket bazlı)
router.get("/", companyBarterAgreementItem_controller_1.getAllCompanyBarterAgreementItemsHandler);
// 4. Yeni item ekleme
router.post("/:barterId", 
/*validateBody,*/ companyBarterAgreementItem_controller_1.postCompanyBarterAgreementItemHandler);
exports.default = router;
