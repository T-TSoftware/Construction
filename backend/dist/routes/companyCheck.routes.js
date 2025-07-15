"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const companyCheck_controller_1 = require("../controllers/companyCheck.controller");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const requestMiddleware_1 = require("../middlewares/requestMiddleware");
const validations_1 = require("../validations/validations");
//import { validateFinanceArrayBody } from "../middlewares/validation.middleware";
const router = (0, express_1.Router)();
// 🛡 Tüm işlemler öncesinde kullanıcı doğrulaması
router.use(authMiddleware_1.authMiddleware);
// 🔐 Only superadmin can post – validation + business logic
router.post("/", (0, requestMiddleware_1.validateArrayBody)((0, validations_1.checkSchema)("create")), companyCheck_controller_1.postCompanyChecksHandler);
router.patch("/:code", (0, requestMiddleware_1.validateBody)((0, validations_1.checkSchema)("update")), companyCheck_controller_1.patchCompanyCheckHandler);
router.get("/", companyCheck_controller_1.getCompanyChecksHandler);
router.get("/:id", companyCheck_controller_1.getCompanyCheckByIdHandler);
exports.default = router;
