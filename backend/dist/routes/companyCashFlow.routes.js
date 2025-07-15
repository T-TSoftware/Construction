"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const companyCashFlow_controller_1 = require("../controllers/companyCashFlow.controller");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authMiddleware);
router.get("/", companyCashFlow_controller_1.getDailyCashflowHandler);
exports.default = router;
