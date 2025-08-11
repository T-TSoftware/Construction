"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const companyCheck_controller_1 = require("../controllers/companyCheck.controller");
const authMiddleware_1 = require("../middlewares/authMiddleware");
//import { validateFinanceArrayBody } from "../middlewares/validation.middleware";
const router = (0, express_1.Router)();
// 🛡 Tüm işlemler öncesinde kullanıcı doğrulaması
router.use(authMiddleware_1.authMiddleware);
// 🔐 Only superadmin can post – validation + business logic
router.post("/", 
//validateArrayBody(checkSchema("create")),
companyCheck_controller_1.postCompanyCheckHandler);
router.patch("/:id", 
//validateBody(checkSchema("update")),
companyCheck_controller_1.patchCompanyCheckHandler);
router.get("/", companyCheck_controller_1.getCompanyChecksHandler);
router.get("/:id", companyCheck_controller_1.getCompanyCheckByIdHandler);
exports.default = router;
