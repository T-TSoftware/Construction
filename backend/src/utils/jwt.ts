// src/utils/jwt.ts
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

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
export const generateToken = (payload: {
  userId: string;
  companyId: string;
  role: string;
}) => {
  const withJti = { ...payload, jti: uuidv4() };
  return jwt.sign(withJti, process.env.JWT_SECRET!, { expiresIn: "2h" });
};

/** Token içinden exp (unix saniye) okur; Redis TTL’de kullanacağız */
export const decodeExp = (token: string): number | null => {
  try {
    const decoded = jwt.decode(token) as { exp?: number } | null;
    return decoded?.exp ?? null;
  } catch {
    return null;
  }
};
