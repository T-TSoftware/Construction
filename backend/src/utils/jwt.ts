// src/utils/jwt.ts
import jwt from "jsonwebtoken";

export const generateToken = (payload: {
  userId: string;
  companyId: string;
  role: string;
}) => {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "30m",
  });
};
