"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const companyCheck_controller_1 = require("../controllers/companyCheck.controller");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const requestValidation_1 = require("../middlewares/requestValidation");
const companyCheck_validation_1 = require("../validations/companyCheck.validation");
//import { validateFinanceArrayBody } from "../middlewares/validation.middleware";
const router = (0, express_1.Router)();
// 🛡 Tüm işlemler öncesinde kullanıcı doğrulaması
router.use(authMiddleware_1.authMiddleware);
// 🔐 Only superadmin can post – validation + business logic
router.post("/", (0, requestValidation_1.validate)(companyCheck_validation_1.checkCreateSchema), companyCheck_controller_1.postCompanyCheckHandler);
router.patch("/:id", (0, requestValidation_1.validate)(companyCheck_validation_1.checkUpdateSchema), companyCheck_controller_1.patchCompanyCheckHandler);
router.get("/", companyCheck_controller_1.getCompanyChecksHandler);
router.get("/:id", companyCheck_controller_1.getCompanyCheckByIdHandler);
exports.default = router;
