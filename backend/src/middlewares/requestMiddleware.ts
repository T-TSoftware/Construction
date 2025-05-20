import { NextFunction, Request, Response } from "express";
import { supplierSchema, stockSchema } from "../validations/validations";
import { ZodError, ZodSchema } from "zod";

/*export const validateSupplierArrayBody = (
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
};*/

/*export const validateStockArrayBody = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!Array.isArray(req.body)) {
      res.status(400).json({ error: "Body bir dizi olmalı." });
    }

    for (const [index, item] of req.body.entries()) {
      stockSchema.parse(item);
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
};*/

/**
 * Generic Zod validator for array-based request bodies
 */
export const validateArrayBody =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!Array.isArray(req.body)) {
        res.status(400).json({ errorMessage: "Body bir dizi olmalı." });
        return;
      }

      for (const item of req.body) {
        schema.parse(item);
      }

      next();
    } catch (error: any) {
      console.error("📛 Validation error:", error);

      if (error instanceof ZodError) {
        const errMessage = error.errors[0]?.message || "Geçersiz veri";
        res.status(400).json({ errorMessage: errMessage });
        return;
      }

      res.status(500).json({ errorMessage: "Sunucu hatası" });
      return;
    }
  };

export const validateBody =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = req.body;
      schema.parse(item);

      next();
    } catch (error: any) {
      console.error("📛 Validation error:", error);

      if (error instanceof ZodError) {
        const errMessage = error.errors[0]?.message || "Geçersiz veri";
        res.status(400).json({ errorMessage: errMessage });
        return;
      }

      res.status(500).json({ errorMessage: "Sunucu hatası" });
      return;
    }
  };
