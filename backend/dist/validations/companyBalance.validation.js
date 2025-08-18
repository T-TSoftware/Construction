"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.balanceUpdateSchema = exports.balanceCreateSchema = void 0;
const zod_1 = require("zod"); /**
 * CREATE /balances
 * - name: boş olamaz, baştaki/sondaki boşluklar kırpılır
 * - amount: sayı, negatif olamaz (başlangıç bakiyesi)
 * - currency: boş olamaz, trim + UPPER yapılır
 */
exports.balanceCreateSchema = zod_1.z.object({
    name: zod_1.z
        .string({ required_error: "Hesap adı zorunludur." })
        .trim()
        .min(1, "Hesap adı zorunludur."),
    amount: zod_1.z.coerce
        .number({
        required_error: "Başlangıç bakiyesi zorunludur.",
        invalid_type_error: "Başlangıç bakiyesi sayısal olmalıdır.",
    })
        .min(0, "Başlangıç bakiyesi negatif olamaz."),
    currency: zod_1.z
        .string({ required_error: "Para birimi zorunludur." })
        .trim()
        .min(1, "Para birimi zorunludur.")
        .transform((v) => v.toUpperCase()),
    // description alanın varsa:
    // description: z.string().trim().optional(),
});
/**
 * UPDATE /balances/:id
 * - Tüm alanlar opsiyonel (partial update)
 * - code/company/createdBy gibi alanlar şemada yok; gelirse görmezden gelinir
 * - en az bir alan gönderilmiş olmalı
 */
exports.balanceUpdateSchema = zod_1.z
    .object({
    name: zod_1.z.string().trim().min(1, "Hesap adı boş olamaz.").optional(),
    amount: zod_1.z.coerce
        .number({ invalid_type_error: "Bakiye sayısal olmalıdır." })
        .min(0, "Bakiye negatif olamaz.")
        .optional(),
    currency: zod_1.z
        .string()
        .trim()
        .min(1, "Para birimi boş olamaz.")
        .transform((v) => v.toUpperCase())
        .optional(),
    // description: z.string().trim().optional(),
})
    .refine((obj) => Object.keys(obj).length > 0, {
    message: "Güncellemek için en az bir alan göndermelisiniz.",
});
/* İsteğe bağlı (ISO 4217) kısıt:
   Eğer para birimini 3 harf ISO ile sınırlamak istersen, currency alanını şu şekilde değiştir:
   .regex(/^[A-Z]{3}$/, "Para birimi 3 harf olmalıdır (örn. TRY, USD).")
*/ 
