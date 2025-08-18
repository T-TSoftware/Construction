"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loanCreateSchema = void 0;
const zod_1 = require("zod");
// Yardımcılar
const Currency = zod_1.z
    .string({ invalid_type_error: "Para birimi metin olmalıdır." })
    .trim()
    .transform((v) => v.toUpperCase())
    .refine((v) => /^[A-Z]{3}$/.test(v), {
    message: "Para birimi 3 harf olmalıdır (örn: TRY, USD, EUR).",
});
const UUID = zod_1.z.string().uuid("Geçerli bir ID giriniz.");
// Çok katı olmayan IBAN/hesap no kontrolü:
// - TR ile başlıyorsa toplam uzunluk 26 olmalı
// - Diğerleri için 10–34 arası alfasayısal
const AccountNo = zod_1.z
    .string({ required_error: "Hesap numarası zorunludur." })
    .trim()
    .min(1, "Hesap numarası zorunludur.")
    .refine((v) => {
    const s = v.replace(/\s+/g, "");
    if (/^TR/i.test(s))
        return s.length === 26;
    return /^[A-Za-z0-9]{10,34}$/.test(s);
}, "Geçerli bir hesap numarası/IBAN giriniz.");
const LoanStatus = zod_1.z.enum(["ACTIVE", "CLOSED", "CANCELED"], {
    invalid_type_error: "Durum geçersiz.",
});
exports.loanCreateSchema = zod_1.z
    .object({
    // code: servis üretir
    name: zod_1.z
        .string({ required_error: "Kredi adı zorunludur." })
        .trim()
        .min(1, "Kredi adı zorunludur."),
    accountNo: AccountNo,
    //bankId: UUID,
    //projectId: UUID.optional(),
    totalAmount: zod_1.z
        .number({
        required_error: "Toplam kredi tutarı zorunludur.",
        invalid_type_error: "Toplam kredi tutarı sayısal olmalıdır.",
    })
        .positive("Toplam kredi tutarı pozitif olmalıdır."),
    remainingPrincipal: zod_1.z
        .number({
        invalid_type_error: "Kalan anapara sayısal olmalıdır.",
    })
        .min(0, "Kalan anapara negatif olamaz.")
        .optional(),
    remainingInstallmentAmount: zod_1.z
        .number({
        required_error: "Kalan taksit toplamı zorunludur.",
        invalid_type_error: "Kalan taksit toplamı sayısal olmalıdır.",
    })
        .positive("Kalan taksit toplamı pozitif olmalıdır."),
    currency: Currency,
    interestRate: zod_1.z
        .number({
        required_error: "Faiz oranı zorunludur.",
        invalid_type_error: "Faiz oranı sayısal olmalıdır.",
    })
        .min(0, "Faiz oranı negatif olamaz.")
        .max(200, "Faiz oranı makul olmalıdır (%0–%200)."),
    totalInstallmentCount: zod_1.z
        .number({
        required_error: "Toplam taksit sayısı zorunludur.",
        invalid_type_error: "Toplam taksit sayısı sayısal olmalıdır.",
    })
        .int("Toplam taksit sayısı tam sayı olmalıdır.")
        .positive("Toplam taksit sayısı pozitif olmalıdır."),
    remainingInstallmentCount: zod_1.z
        .number({
        invalid_type_error: "Kalan taksit sayısı sayısal olmalıdır.",
    })
        .int("Kalan taksit sayısı tam sayı olmalıdır.")
        .min(0, "Kalan taksit sayısı negatif olamaz.")
        .optional(),
    loanDate: zod_1.z
        .coerce
        .date({ invalid_type_error: "Geçerli bir kredi tarihi giriniz." }),
    purpose: zod_1.z.string().trim().optional(),
    loanType: zod_1.z.string().trim().optional(),
    //status: LoanStatus.optional().default("ACTIVE"),
    description: zod_1.z.string().trim().optional(),
})
    .superRefine((data, ctx) => {
    // remainingPrincipal default: totalAmount (servis davranışıyla uyumlu)
    /*const remainingPrincipal =
      typeof data.remainingPrincipal === "number"
        ? data.remainingPrincipal
        : data.totalAmount;

    if (remainingPrincipal < 0 || remainingPrincipal > data.totalAmount) {
      ctx.addIssue({
        code: "custom",
        path: ["remainingPrincipal"],
        message:
          "Kalan anapara, 0 ile toplam kredi tutarı arasında olmalıdır.",
      });
    }*/
    // Kalan taksit toplamı ≥ kalan anapara (faiz içerdiği varsayımı)
    if (data.remainingInstallmentAmount < data.totalAmount) {
        ctx.addIssue({
            code: "custom",
            path: ["remainingInstallmentAmount"],
            message: "Kalan taksit toplamı, kalan anaparadan küçük olamaz.",
        });
    }
    // remainingInstallmentCount default: totalInstallmentCount
    /*const remainingInstallmentCount =
      typeof data.remainingInstallmentCount === "number"
        ? data.remainingInstallmentCount
        : data.totalInstallmentCount;

    if (
      remainingInstallmentCount < 0 ||
      remainingInstallmentCount > data.totalInstallmentCount
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["remainingInstallmentCount"],
        message:
          "Kalan taksit sayısı, 0 ile toplam taksit sayısı arasında olmalıdır.",
      });
    }*/
    // Gelecek tarih engeli (istersen kaldırabilirsin)
    const now = new Date();
    if (data.loanDate.getTime() > now.getTime()) {
        ctx.addIssue({
            code: "custom",
            path: ["loanDate"],
            message: "Kredi tarihi gelecekte olamaz.",
        });
    }
});
