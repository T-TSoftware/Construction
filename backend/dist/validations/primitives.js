"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uuid = exports.str = void 0;
// src/validations/primitives.ts
const zod_1 = require("zod");
// ortak string
const str = (min = 1, max = 255) => zod_1.z.string().trim().min(min).max(max);
exports.str = str;
// upper-case unit/kategori gibi alanlar
/*export const upperStr = (min = 1, max = 100) =>
  z.string().transform(s => s.trim().toUpperCase()).min(min).max(max);*/
// uuid
exports.uuid = zod_1.z.string().uuid();
// para/sayı
/*export const money = z.coerce.number().finite().nonnegative(); // istersen .max(1_000_000_000)
export const pos = z.coerce.number().finite().positive();
export const nonneg = z.coerce.number().finite().nonnegative();
*/
// tarih
//export const date = z.coerce.date().pipe(z.date());
