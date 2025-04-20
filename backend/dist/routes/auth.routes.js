"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/auth.routes.ts
const express_1 = require("express");
const auth_controllers_1 = require("../controllers/auth.controllers");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.post("/login", auth_controllers_1.loginHandler);
router.post("/register", authMiddleware_1.authMiddleware, auth_controllers_1.registerHandler);
exports.default = router;
