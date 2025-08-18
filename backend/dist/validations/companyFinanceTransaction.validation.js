"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.financeTransactionUpdateSchema = exports.financeTransactionCreateSchema = void 0;
// src/validations/financeTransaction.ts
const zod_1 = require("zod");
/** Türkçe enum hata haritası (opsiyonel, globalde bir kez tanımlayabilirsin) */
zod_1.z.setErrorMap((issue, ctx) => {
    if (issue.code === "invalid_enum_value") {
        const beklenen = Array.isArray(issue.options)
            ? issue.options.join(" | ")
            : "geçerli seçenek";
        return { message: `Geçersiz değer. Beklenen: ${beklenen}.` };
    }
    return { message: ctx.defaultError };
});
const TypeEnum = zod_1.z.enum(["PAYMENT", "COLLECTION", "TRANSFER"], {
    required_error: "İşlem tipi zorunludur.",
});
const invoiceYNEnum = zod_1.z.enum(["Y", "N"]).optional().default("N");
/** Referans kodu zorunlu olan kategoriler (servisin branch’lerine göre) */
const CATEGORIES_NEED_REF = new Set([
    "ORDER",
    "CHECK",
    "LOAN",
    "SUBCONTRACTOR",
    "SUPPLIER",
    "BARTER",
]);
/** Kategori: serbest bir string bırakıyoruz;
 * ama yukarıdaki set’te ise referenceCode zorunlu diyoruz */
const Category = zod_1.z
    .string({
    required_error: "Kategori zorunludur.",
    invalid_type_error: "Kategori metin olmalıdır.",
})
    .trim()
    .min(1, "Kategori zorunludur.");
/** 3 harfli ISO para birimi + otomatik uppercase */
const Currency = zod_1.z
    .string({
    required_error: "Para birimi zorunludur.",
    invalid_type_error: "Para birimi metin olmalıdır.",
})
    .trim()
    .transform((v) => v.toUpperCase())
    .refine((v) => /^[A-Z]{3}$/.test(v), {
    message: "Para birimi 3 harf olmalıdır (örn: TRY, USD, EUR).",
});
exports.financeTransactionCreateSchema = zod_1.z
    .object({
    /** Temel alanlar */
    type: TypeEnum,
    amount: zod_1.z
        .number({
        required_error: "Tutar zorunludur.",
        invalid_type_error: "Tutar sayısal olmalıdır.",
    })
        .positive("Tutar pozitif olmalıdır."),
    currency: Currency,
    /** Hesap alanları */
    fromAccountCode: zod_1.z
        .string({
        required_error: "Kaynak hesap (fromAccountCode) zorunludur.",
        invalid_type_error: "Kaynak hesap metin olmalıdır.",
    })
        .trim()
        .min(1, "Kaynak hesap (fromAccountCode) zorunludur."),
    toAccountCode: zod_1.z.string().trim().optional(),
    /** Hedef/bağlantı alanları — opsiyonel */
    targetType: zod_1.z.string().trim().optional(),
    targetId: zod_1.z.string().trim().optional(),
    targetName: zod_1.z.string().trim().optional(),
    /** Tarih / yöntem / kategori */
    transactionDate: zod_1.z.coerce.date({
        invalid_type_error: "Geçerli bir işlem tarihi giriniz.",
    }),
    method: zod_1.z
        .string({
        required_error: "Ödeme yöntemi zorunludur.",
        invalid_type_error: "Ödeme yöntemi metin olmalıdır.",
    })
        .trim()
        .min(1, "Ödeme yöntemi zorunludur."),
    category: Category,
    /** Fatura alanları */
    invoiceYN: invoiceYNEnum,
    invoiceCode: zod_1.z.string().trim().optional(),
    /** İşlemin dayandığı referans (ORDER/CHECK/LOAN/SUBCONTRACTOR/SUPPLIER/BARTER için zorunlu) */
    referenceCode: zod_1.z.string().trim().optional(),
    description: zod_1.z.string().trim().optional(),
    /** Proje/Source opsiyonel */
    projectId: zod_1.z.string().uuid("Geçerli bir proje ID giriniz.").optional(),
    source: zod_1.z.string().trim().optional(),
})
    .superRefine((data, ctx) => {
    // TRANSFER ise: toAccountCode zorunlu + from ≠ to
    if (data.type === "TRANSFER") {
        if (!data.toAccountCode || data.toAccountCode.trim() === "") {
            ctx.addIssue({
                code: "custom",
                path: ["toAccountCode"],
                message: "Transfer işlemi için hedef hesap (toAccountCode) zorunludur.",
            });
        }
        if (data.toAccountCode &&
            data.toAccountCode.trim() === data.fromAccountCode.trim()) {
            ctx.addIssue({
                code: "custom",
                path: ["toAccountCode"],
                message: "Transfer işlemlerinde kaynak ve hedef hesap aynı olamaz.",
            });
        }
    }
    else {
        // TRANSFER değilse: toAccountCode gönderilmemeli (yanlış kullanım)
        if (data.toAccountCode && data.toAccountCode.trim() !== "") {
            ctx.addIssue({
                code: "custom",
                path: ["toAccountCode"],
                message: "toAccountCode yalnızca TRANSFER işleminde gönderilebilir.",
            });
        }
    }
    // Fatura: invoiceYN = Y ise invoiceCode zorunlu
    if (data.invoiceYN === "Y") {
        if (!data.invoiceCode || data.invoiceCode.trim() === "") {
            ctx.addIssue({
                code: "custom",
                path: ["invoiceCode"],
                message: "Fatura işaretlendi. Fatura numarası (invoiceCode) zorunludur.",
            });
        }
    }
    // Referans gerektiren kategoriler
    if (CATEGORIES_NEED_REF.has(data.category)) {
        if (!data.referenceCode || data.referenceCode.trim() === "") {
            ctx.addIssue({
                code: "custom",
                path: ["referenceCode"],
                message: `${data.category} işlemi için referenceCode zorunludur.`,
            });
        }
    }
    // (İSTEĞE BAĞLI) İşlem tarihi gelecekte olmasın:
    // Finans akışında planlama yapılıyor olabilir; aktif etmek istersen yorum satırını kaldır.
    const now = new Date();
    if (data.transactionDate.getTime() > now.getTime()) {
        ctx.addIssue({
            code: "custom",
            path: ["transactionDate"],
            message: "İşlem tarihi gelecekte olamaz.",
        });
    }
});
exports.financeTransactionUpdateSchema = zod_1.z
    .object({
    type: TypeEnum.optional(),
    amount: zod_1.z
        .number({ invalid_type_error: "Tutar sayısal olmalıdır." })
        .positive("Tutar pozitif olmalıdır.")
        .optional(),
    currency: Currency.optional(),
    fromAccountCode: zod_1.z
        .string({ invalid_type_error: "Kaynak hesap metin olmalıdır." })
        .trim()
        .min(1, "Kaynak hesap boş olamaz.")
        .optional(),
    toAccountCode: zod_1.z
        .string({ invalid_type_error: "Hedef hesap metin olmalıdır." })
        .trim()
        .min(1, "Hedef hesap boş olamaz.")
        .optional(),
    targetType: zod_1.z.string().trim().optional(),
    targetId: zod_1.z.string().trim().optional(),
    targetName: zod_1.z.string().trim().optional(),
    transactionDate: zod_1.z.coerce
        .date({ invalid_type_error: "Geçerli bir işlem tarihi giriniz." })
        .optional(),
    method: zod_1.z
        .string({ invalid_type_error: "Ödeme yöntemi metin olmalıdır." })
        .trim()
        .min(1, "Ödeme yöntemi boş olamaz.")
        .optional(),
    category: zod_1.z
        .string({ invalid_type_error: "Kategori metin olmalıdır." })
        .trim()
        .min(1, "Kategori boş olamaz.")
        .optional(),
    invoiceYN: invoiceYNEnum.optional(),
    invoiceCode: zod_1.z.string().trim().optional(),
    referenceCode: zod_1.z.string().trim().optional(),
    description: zod_1.z.string().trim().optional(),
    projectId: zod_1.z.string().uuid("Geçerli bir proje ID giriniz.").optional(),
})
    .superRefine((data, ctx) => {
    // 1) TRANSFER mantığı (PATCH’e uygun şekilde)
    // - toAccountCode gönderiliyorsa, type da TRANSFER olmalı
    if (data.toAccountCode && data.type && data.type !== "TRANSFER") {
        ctx.addIssue({
            code: "custom",
            path: ["toAccountCode"],
            message: "toAccountCode yalnızca TRANSFER işleminde güncellenebilir. Lütfen type=TRANSFER gönderin.",
        });
    }
    // - type=TRANSFER gönderiliyorsa, aynı istekte toAccountCode zorunlu
    if (data.type === "TRANSFER" && !data.toAccountCode) {
        ctx.addIssue({
            code: "custom",
            path: ["toAccountCode"],
            message: "type=TRANSFER güncellemesinde hedef hesap (toAccountCode) zorunludur.",
        });
    }
    // - aynı istekte from ve to aynı olamaz
    if (data.fromAccountCode &&
        data.toAccountCode &&
        data.fromAccountCode.trim() === data.toAccountCode.trim()) {
        ctx.addIssue({
            code: "custom",
            path: ["toAccountCode"],
            message: "Kaynak ve hedef hesap aynı olamaz.",
        });
    }
    // 2) Fatura mantığı
    if (data.invoiceYN === "Y" &&
        (!data.invoiceCode || data.invoiceCode.trim() === "")) {
        ctx.addIssue({
            code: "custom",
            path: ["invoiceCode"],
            message: "Fatura işaretlendi (invoiceYN=Y). Fatura numarası (invoiceCode) zorunludur.",
        });
    }
    // 3) Referans kodu gerektiren kategoriler
    if (data.category && CATEGORIES_NEED_REF.has(data.category)) {
        if (!data.referenceCode || data.referenceCode.trim() === "") {
            ctx.addIssue({
                code: "custom",
                path: ["referenceCode"],
                message: `${data.category} işlemi için referenceCode zorunludur.`,
            });
        }
    }
    // 4) (Opsiyonel) Gelecek tarih uyarısı (açmak istersen yorumdan çıkar)
    if (data.transactionDate) {
        const now = new Date();
        if (data.transactionDate.getTime() > now.getTime()) {
            ctx.addIssue({
                code: "custom",
                path: ["transactionDate"],
                message: "İşlem tarihi gelecekte olamaz.",
            });
        }
    }
});
