"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeExp = exports.generateToken = void 0;
// src/utils/jwt.ts
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
/*export const generateToken = (payload: {
  userId: string;
  companyId: string;
  role: string;
}) => {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "2h",
  });
};*/
/** Access token üret: payload + benzersiz jti */
const generateToken = (payload) => {
    const withJti = { ...payload, jti: (0, uuid_1.v4)() };
    return jsonwebtoken_1.default.sign(withJti, process.env.JWT_SECRET, { expiresIn: "2h" });
};
exports.generateToken = generateToken;
/** Token içinden exp (unix saniye) okur; Redis TTL’de kullanacağız */
const decodeExp = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.decode(token);
        return decoded?.exp ?? null;
    }
    catch {
        return null;
    }
};
exports.decodeExp = decodeExp;
