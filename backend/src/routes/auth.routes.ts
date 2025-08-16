// src/routes/auth.routes.ts
import { Router } from "express";
import { loginHandler, logoutHandler, registerHandler } from "../controllers/auth.controllers";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();
router.post("/login", loginHandler);
router.post("/register", authMiddleware, registerHandler);
router.post("/logout", authMiddleware, logoutHandler);
export default router;
