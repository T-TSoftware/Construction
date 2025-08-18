// src/validations/primitives.ts
import { z } from "zod";

// ortak string
export const str = (min = 1, max = 255) =>
  z.string().trim().min(min).max(max);

// upper-case unit/kategori gibi alanlar
/*export const upperStr = (min = 1, max = 100) =>
  z.string().transform(s => s.trim().toUpperCase()).min(min).max(max);*/

// uuid
export const uuid = z.string().uuid();

// para/sayı
/*export const money = z.coerce.number().finite().nonnegative(); // istersen .max(1_000_000_000)
export const pos = z.coerce.number().finite().positive();
export const nonneg = z.coerce.number().finite().nonnegative();
*/

// tarih
//export const date = z.coerce.date().pipe(z.date());