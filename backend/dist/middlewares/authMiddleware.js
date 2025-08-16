"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
// src/middlewares/authMiddleware.ts
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const tokenBlackList_1 = require("../utils/tokenBlackList");
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
const authMiddleware = async (req, res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    const token = header.split(" ")[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // 🔒 Kara liste kontrolü
        if (await (0, tokenBlackList_1.isBlacklisted)(decoded.jti)) {
            res.status(401).json({ error: "Token revoked" });
            return;
        }
        req.user = {
            userId: decoded.userId,
            companyId: decoded.companyId,
            role: decoded.role,
        };
        // İstersen logout’ta kullanmak için:
        req.jti = decoded.jti;
        next();
    }
    catch {
        res.status(401).json({ error: "Invalid token" });
    }
};
exports.authMiddleware = authMiddleware;
