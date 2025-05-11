// src/middlewares/authMiddleware.ts
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
      companyId: string;
      role: string;
    };

    req.user = decoded; // ✅ IntelliSense çalışır, hata vermez
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
    return;
  }
};
