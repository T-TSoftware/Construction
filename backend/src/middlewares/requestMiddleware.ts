import { NextFunction, Request, Response } from "express";
import { supplierSchema } from "../validations/projectSupplier.validation";
import { ZodError } from "zod";

export const validateSupplierArrayBody = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!Array.isArray(req.body)) {
      res.status(400).json({ error: "Body bir dizi olmalı." });
    }

    for (const [index, item] of req.body.entries()) {
      supplierSchema.parse(item);
    }

    next();
  } catch (error: any) {
    console.error("📛 Validation error:", error);
    if (error instanceof ZodError) {
      const errMessage = error.errors[0]?.message || "Geçersiz veri";
      res.status(400).json({ errorMessage: errMessage });
      return;
    }
    //res.status(400).json({ error: "Geçersiz veri", details: error.errors });
    return;
  }
};
