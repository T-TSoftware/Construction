// src/middlewares/validate.ts
import { RequestHandler } from "express";
import { ZodError, ZodSchema } from "zod";

export const validate = (schema: ZodSchema): RequestHandler => {
  return (req, res, next): void => {
    try {
      // parse edilirken dönüştürmeler (trim/transform) uygulanır
      const parsed = schema.parse(req.body);
      req.body = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const msg = err.errors[0]?.message ?? "Geçersiz veri";
        res.status(400).json({ errorMessage: msg });
        return; // <-- void döner
      }
      next(err); // diğer hataları error handler'a ilet
    }
  };
};

export const validateArray = (schema: ZodSchema): RequestHandler => {
  return (req, res, next): void => {
    try {
      // parse edilirken dönüştürmeler (trim/transform) uygulanır
      for (const item of req.body) {
        schema.parse(item);
      }

      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const msg = err.errors[0]?.message ?? "Geçersiz veri";
        res.status(400).json({ errorMessage: msg });
        return; // <-- void döner
      }
      next(err); // diğer hataları error handler'a ilet
    }
  };
};