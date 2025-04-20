// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";
import { generateToken } from "../utils/jwt";
import { loginUser, registerUser } from "../services/auth.service";

const userRepo = AppDataSource.getRepository(User);

export const loginHandler = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required." });
      return;
    }

    const result = await loginUser(email, password);
    res.status(200).json(result);
  } catch (error: any) {
    console.error("❌ Login error:", error);
    res.status(401).json({ error: error.message || "Login failed." });
  }
};

// export const registerHandler = async (req: Request, res: Response) => {
//   try {
//     const { name, email, password, role, companyId } = req.body;

//     if (!name || !email || !password || !role || !companyId) {
//       res.status(400).json({ error: "All fields are required." });
//       return;
//     }

//     const user = await registerUser({ name, email, password, role, companyId });
//     res.status(201).json(user);
//   } catch (error: any) {
//     console.error("❌ Register error:", error);
//     res.status(400).json({ error: error.message || "Register failed." });
//   }
// };

export const registerHandler = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      res.status(400).json({ error: "All fields are required." });
      return;
    }

    const createdByCompanyId = req.user!.companyId;

    const user = await registerUser({
      name,
      email,
      password,
      role,
      createdByCompanyId,
    });

    res.status(201).json(user);
  } catch (error: any) {
    console.error("❌ Register error:", error);
    res.status(400).json({ error: error.message || "Register failed." });
  }
};
