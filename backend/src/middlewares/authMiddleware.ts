// src/middlewares/authMiddleware.ts
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { isBlacklisted } from "../utils/tokenBlackList";

/*export const authMiddleware = (
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
      userId: string;
      companyId: string;
      role: string;
    };

    req.user = decoded; // ✅ IntelliSense çalışır, hata vermez
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
    return;
  }
};*/



export const authMiddleware = async (
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
      userId: string;
      companyId: string;
      role: string;
      jti: string;
    };

    // 🔒 Kara liste kontrolü
    if (await isBlacklisted(decoded.jti)) {
      res.status(401).json({ error: "Token revoked" });
      return;
    }

    req.user = {
      userId: decoded.userId,
      companyId: decoded.companyId,
      role: decoded.role,
    };

    // İstersen logout’ta kullanmak için:
    (req as any).jti = decoded.jti;

    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};
