"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const companyBarterItemCashDetail_controller_1 = require("../controllers/companyBarterItemCashDetail.controller");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authMiddleware);
router.post("/:barterItemId", 
/* validateBody, */ companyBarterItemCashDetail_controller_1.postCompanyBarterCashDetailsHandler);
router.get("/:barterItemId", companyBarterItemCashDetail_controller_1.getCompanyBarterCashDetailsByItemIdHandler);
router.patch("/", companyBarterItemCashDetail_controller_1.patchCompanyBarterCashDetailsHandler);
exports.default = router;
