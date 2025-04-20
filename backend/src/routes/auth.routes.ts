// src/routes/auth.routes.ts
import { Router } from "express";
import { loginHandler,registerHandler } from "../controllers/auth.controllers";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();
router.post("/login", loginHandler);
router.post("/register", authMiddleware, registerHandler);
export default router;
