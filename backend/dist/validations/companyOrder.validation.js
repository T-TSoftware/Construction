"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderCreateSchema = void 0;
// validations/order.ts
const zod_1 = require("zod");
exports.orderCreateSchema = zod_1.z.object({
    stockId: zod_1.z
        .string({ required_error: "Stok seçimi zorunludur." })
        .uuid("Geçerli bir stok ID giriniz."),
    projectId: zod_1.z
        .string()
        .uuid("Geçerli bir proje ID giriniz.")
        .optional(),
    customerName: zod_1.z
        .string({ required_error: "Müşteri adı zorunludur." })
        .trim()
        .min(2, "Müşteri adı en az 2 karakter olmalıdır.")
        .max(120, "Müşteri adı 120 karakteri aşamaz."),
    totalAmount: zod_1.z
        .coerce.number({
        required_error: "Toplam tutar zorunludur.",
        invalid_type_error: "Toplam tutar sayısal olmalıdır.",
    })
        .gt(0, "Toplam tutar 0'dan büyük olmalıdır."),
    description: zod_1.z
        .string()
        .trim()
        .max(2000, "Açıklama 2000 karakteri aşamaz.")
        .optional(),
    // Not: stockType servisinde string; ileride enum'a dönüştürmek mantıklı olur.
    stockType: zod_1.z
        .string({ required_error: "Stok tipi zorunludur." })
        .trim()
        .min(1, "Stok tipi boş olamaz.")
        .max(50, "Stok tipi 50 karakteri aşamaz.")
        .transform((v) => v.toUpperCase()),
})
    .superRefine((data, ctx) => {
    // İstenirse ek iş kuralı örnekleri:
    // - Müşteri adı yalnızca rakamlardan oluşmasın
    if (/^\d+$/.test(data.customerName)) {
        ctx.addIssue({
            code: "custom",
            path: ["customerName"],
            message: "Müşteri adı yalnızca rakamlardan oluşamaz.",
        });
    }
    // - İleride “HİZMET”, “MAL” gibi sınırlı tipler kullanılacaksa burada şimdilik uyarı bırakılabilir
    // const allowed = ["MAL", "HİZMET", "DİĞER"];
    // if (!allowed.includes(data.stockType)) {
    //   ctx.addIssue({
    //     code: "custom",
    //     path: ["stockType"],
    //     message: `Geçersiz stok tipi. (${allowed.join(", ")})`,
    //   });
    // }
});
