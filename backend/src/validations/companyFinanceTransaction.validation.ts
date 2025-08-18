// src/validations/financeTransaction.ts
import { z } from "zod";

/** Türkçe enum hata haritası (opsiyonel, globalde bir kez tanımlayabilirsin) */
z.setErrorMap((issue, ctx) => {
  if (issue.code === "invalid_enum_value") {
    const beklenen = Array.isArray(issue.options)
      ? issue.options.join(" | ")
      : "geçerli seçenek";
    return { message: `Geçersiz değer. Beklenen: ${beklenen}.` };
  }
  return { message: ctx.defaultError };
});

const TypeEnum = z.enum(["PAYMENT", "COLLECTION", "TRANSFER"], {
  required_error: "İşlem tipi zorunludur.",
});

const invoiceYNEnum = z.enum(["Y", "N"]).optional().default("N");

/** Referans kodu zorunlu olan kategoriler (servisin branch’lerine göre) */
const CATEGORIES_NEED_REF = new Set([
  "ORDER",
  "CHECK",
  "LOAN",
  "SUBCONTRACTOR",
  "SUPPLIER",
  "BARTER",
] as const);

/** Kategori: serbest bir string bırakıyoruz;
 * ama yukarıdaki set’te ise referenceCode zorunlu diyoruz */
const Category = z
  .string({
    required_error: "Kategori zorunludur.",
    invalid_type_error: "Kategori metin olmalıdır.",
  })
  .trim()
  .min(1, "Kategori zorunludur.");

/** 3 harfli ISO para birimi + otomatik uppercase */
const Currency = z
  .string({
    required_error: "Para birimi zorunludur.",
    invalid_type_error: "Para birimi metin olmalıdır.",
  })
  .trim()
  .transform((v) => v.toUpperCase())
  .refine((v) => /^[A-Z]{3}$/.test(v), {
    message: "Para birimi 3 harf olmalıdır (örn: TRY, USD, EUR).",
  });

export const financeTransactionCreateSchema = z
  .object({
    /** Temel alanlar */
    type: TypeEnum,
    amount: z
      .number({
        required_error: "Tutar zorunludur.",
        invalid_type_error: "Tutar sayısal olmalıdır.",
      })
      .positive("Tutar pozitif olmalıdır."),
    currency: Currency,

    /** Hesap alanları */
    fromAccountCode: z
      .string({
        required_error: "Kaynak hesap (fromAccountCode) zorunludur.",
        invalid_type_error: "Kaynak hesap metin olmalıdır.",
      })
      .trim()
      .min(1, "Kaynak hesap (fromAccountCode) zorunludur."),
    toAccountCode: z.string().trim().optional(),

    /** Hedef/bağlantı alanları — opsiyonel */
    targetType: z.string().trim().optional(),
    targetId: z.string().trim().optional(),
    targetName: z.string().trim().optional(),

    /** Tarih / yöntem / kategori */
    transactionDate: z.coerce.date({
      invalid_type_error: "Geçerli bir işlem tarihi giriniz.",
    }),
    method: z
      .string({
        required_error: "Ödeme yöntemi zorunludur.",
        invalid_type_error: "Ödeme yöntemi metin olmalıdır.",
      })
      .trim()
      .min(1, "Ödeme yöntemi zorunludur."),
    category: Category,

    /** Fatura alanları */
    invoiceYN: invoiceYNEnum,
    invoiceCode: z.string().trim().optional(),

    /** İşlemin dayandığı referans (ORDER/CHECK/LOAN/SUBCONTRACTOR/SUPPLIER/BARTER için zorunlu) */
    referenceCode: z.string().trim().optional(),

    description: z.string().trim().optional(),

    /** Proje/Source opsiyonel */
    projectId: z.string().uuid("Geçerli bir proje ID giriniz.").optional(),
    source: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    // TRANSFER ise: toAccountCode zorunlu + from ≠ to
    if (data.type === "TRANSFER") {
      if (!data.toAccountCode || data.toAccountCode.trim() === "") {
        ctx.addIssue({
          code: "custom",
          path: ["toAccountCode"],
          message:
            "Transfer işlemi için hedef hesap (toAccountCode) zorunludur.",
        });
      }
      if (
        data.toAccountCode &&
        data.toAccountCode.trim() === data.fromAccountCode.trim()
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["toAccountCode"],
          message: "Transfer işlemlerinde kaynak ve hedef hesap aynı olamaz.",
        });
      }
    } else {
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
          message:
            "Fatura işaretlendi. Fatura numarası (invoiceCode) zorunludur.",
        });
      }
    }

    // Referans gerektiren kategoriler
    if (CATEGORIES_NEED_REF.has(data.category as any)) {
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

export const financeTransactionUpdateSchema = z
  .object({
    type: TypeEnum.optional(),

    amount: z
      .number({ invalid_type_error: "Tutar sayısal olmalıdır." })
      .positive("Tutar pozitif olmalıdır.")
      .optional(),

    currency: Currency.optional(),

    fromAccountCode: z
      .string({ invalid_type_error: "Kaynak hesap metin olmalıdır." })
      .trim()
      .min(1, "Kaynak hesap boş olamaz.")
      .optional(),

    toAccountCode: z
      .string({ invalid_type_error: "Hedef hesap metin olmalıdır." })
      .trim()
      .min(1, "Hedef hesap boş olamaz.")
      .optional(),

    targetType: z.string().trim().optional(),
    targetId: z.string().trim().optional(),
    targetName: z.string().trim().optional(),

    transactionDate: z.coerce
      .date({ invalid_type_error: "Geçerli bir işlem tarihi giriniz." })
      .optional(),

    method: z
      .string({ invalid_type_error: "Ödeme yöntemi metin olmalıdır." })
      .trim()
      .min(1, "Ödeme yöntemi boş olamaz.")
      .optional(),

    category: z
      .string({ invalid_type_error: "Kategori metin olmalıdır." })
      .trim()
      .min(1, "Kategori boş olamaz.")
      .optional(),

    invoiceYN: invoiceYNEnum.optional(),
    invoiceCode: z.string().trim().optional(),

    referenceCode: z.string().trim().optional(),

    description: z.string().trim().optional(),

    projectId: z.string().uuid("Geçerli bir proje ID giriniz.").optional(),
  })
  .superRefine((data, ctx) => {
    // 1) TRANSFER mantığı (PATCH’e uygun şekilde)
    // - toAccountCode gönderiliyorsa, type da TRANSFER olmalı
    if (data.toAccountCode && data.type && data.type !== "TRANSFER") {
      ctx.addIssue({
        code: "custom",
        path: ["toAccountCode"],
        message:
          "toAccountCode yalnızca TRANSFER işleminde güncellenebilir. Lütfen type=TRANSFER gönderin.",
      });
    }

    // - type=TRANSFER gönderiliyorsa, aynı istekte toAccountCode zorunlu
    if (data.type === "TRANSFER" && !data.toAccountCode) {
      ctx.addIssue({
        code: "custom",
        path: ["toAccountCode"],
        message:
          "type=TRANSFER güncellemesinde hedef hesap (toAccountCode) zorunludur.",
      });
    }

    // - aynı istekte from ve to aynı olamaz
    if (
      data.fromAccountCode &&
      data.toAccountCode &&
      data.fromAccountCode.trim() === data.toAccountCode.trim()
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["toAccountCode"],
        message: "Kaynak ve hedef hesap aynı olamaz.",
      });
    }

    // 2) Fatura mantığı
    if (
      data.invoiceYN === "Y" &&
      (!data.invoiceCode || data.invoiceCode.trim() === "")
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["invoiceCode"],
        message:
          "Fatura işaretlendi (invoiceYN=Y). Fatura numarası (invoiceCode) zorunludur.",
      });
    }

    // 3) Referans kodu gerektiren kategoriler
    if (data.category && CATEGORIES_NEED_REF.has(data.category as any)) {
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
