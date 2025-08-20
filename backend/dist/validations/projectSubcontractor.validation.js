"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subcontractorUpdateSchema = exports.subcontractorCreateSchema = void 0;
// validations/subcontractor.ts
const zod_1 = require("zod");
/** İzin verilen durumlar — modelde string olsa da burada kontrollü tutmak iyi olur */
const SubcontractorStatus = zod_1.z.enum([
    "NEW",
    "PENDING",
    "APPROVED",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
]);
exports.subcontractorCreateSchema = zod_1.z
    .object({
    /*projectId: z
      .string({ required_error: "Proje zorunludur." })
      .uuid("Geçerli bir proje ID giriniz."),*/
    category: zod_1.z
        .string({ required_error: "Kategori zorunludur." })
        .trim()
        .min(1, "Kategori boş olamaz.")
        .max(100, "Kategori 100 karakteri aşamaz.")
        .transform((v) => v.toUpperCase()),
    companyName: zod_1.z
        .string()
        .trim()
        .max(150, "Firma adı 150 karakteri aşamaz.")
        .optional(),
    unit: zod_1.z
        .string({ required_error: "Birim zorunludur." })
        .trim()
        .min(1, "Birim boş olamaz.")
        .max(20, "Birim 20 karakteri aşamaz.")
        .transform((v) => v.toUpperCase()),
    unitPrice: zod_1.z.coerce
        .number({ invalid_type_error: "Birim fiyat sayısal olmalıdır." })
        .positive("Birim fiyat sıfırdan büyük olmalıdır.")
        .optional(),
    quantity: zod_1.z.coerce
        .number({ invalid_type_error: "Miktar sayısal olmalıdır." })
        .positive("Miktar sıfırdan büyük olmalıdır.")
        .optional(),
    contractAmount: zod_1.z.coerce
        .number({ invalid_type_error: "Sözleşme tutarı sayısal olmalıdır." })
        .positive("Sözleşme tutarı sıfırdan büyük olmalıdır.")
        .optional(),
    status: SubcontractorStatus.default("NEW").describe("Kayıt durumu"),
    description: zod_1.z
        .string()
        .trim()
        .max(500, "Açıklama 500 karakteri aşamaz.")
        .optional(),
})
    .superRefine((data, ctx) => {
    // 2) unitPrice / quantity / contractAmount birlikte zorunlu
    const trio = [
        "unitPrice",
        "quantity",
        "contractAmount",
    ];
    const present = trio.filter((k) => data[k] !== undefined);
    if (present.length > 0 && present.length < 3) {
        // Hangileri eksikse tek tek işaretleyelim
        trio
            .filter((k) => data[k] === undefined)
            .forEach((missing) => {
            ctx.addIssue({
                code: "custom",
                path: [missing],
                message: "Birim fiyat, miktar ve sözleşme tutarı birlikte gönderilmelidir.",
            });
        });
    }
    // Her ikisi de mevcutsa, tutarlılık kontrolü yap
    /*if (hasCalcPair && hasContract) {
      const calc = Number((data.unitPrice! * data.quantity!).toFixed(2));
      const given = Number((data.contractAmount!).toFixed(2));
      const diff = Math.abs(calc - given);

      // ±0.5 birim tolerans tanıyalım (kuru/küsurat farkları için)
      if (diff > 0.5) {
        ctx.addIssue({
          code: "custom",
          path: ["contractAmount"],
          message: `Sözleşme tutarı ile (birim fiyat × miktar) uyuşmuyor. Beklenen ~${calc}, girilen ${given}.`,
        });
      }
    }*/
});
/** Büyük harfe çevir + trim */
const toUpperTrim = (s) => s.trim().toUpperCase();
/** DÜZ (tek) SUBCONTRACTOR UPDATE şeması */
exports.subcontractorUpdateSchema = zod_1.z
    .object({
    companyName: zod_1.z
        .string({ invalid_type_error: "Firma adı metin olmalıdır." })
        .trim()
        .max(150, "Firma adı 150 karakteri aşamaz.")
        .optional(),
    unit: zod_1.z
        .string({ invalid_type_error: "Birim metin olmalıdır." })
        .trim()
        .min(1, "Birim boş olamaz.")
        .max(20, "Birim 20 karakteri aşamaz.")
        .transform(toUpperTrim)
        .optional(),
    unitPrice: zod_1.z.coerce
        .number({ invalid_type_error: "Birim fiyat sayı olmalıdır." })
        .positive("Birim fiyat sıfırdan büyük olmalıdır.")
        .optional(),
    quantity: zod_1.z.coerce
        .number({ invalid_type_error: "Miktar sayı olmalıdır." })
        .positive("Miktar sıfırdan büyük olmalıdır.")
        .optional(),
    category: zod_1.z
        .string({ invalid_type_error: "Kategori metin olmalıdır." })
        .trim()
        .min(1, "Kategori boş olamaz.")
        .max(100, "Kategori 100 karakteri aşamaz.")
        .transform(toUpperTrim)
        .optional(),
    contractAmount: zod_1.z.coerce
        .number({ invalid_type_error: "Sözleşme tutarı sayı olmalıdır." })
        .positive("Sözleşme tutarı sıfırdan büyük olmalıdır.")
        .optional(),
    paidAmount: zod_1.z.coerce
        .number({ invalid_type_error: "Ödenen tutar sayı olmalıdır." })
        .min(0, "Ödenen tutar negatif olamaz.")
        .optional(),
    status: zod_1.z
        .string({ invalid_type_error: "Durum metin olmalıdır." })
        .trim()
        .max(30, "Durum 30 karakteri aşamaz.")
        .optional(),
    description: zod_1.z
        .string({ invalid_type_error: "Açıklama metin olmalıdır." })
        .trim()
        .max(500, "Açıklama 500 karakteri aşamaz.")
        .optional(),
})
    .strict() // Tanımsız/ekstra alanları reddet
    .superRefine((data, ctx) => {
    // 1) En az bir alan gönderilmeli
    if (data.companyName === undefined &&
        data.unit === undefined &&
        data.unitPrice === undefined &&
        data.quantity === undefined &&
        data.category === undefined &&
        data.contractAmount === undefined &&
        data.paidAmount === undefined &&
        data.status === undefined &&
        data.description === undefined) {
        ctx.addIssue({
            code: "custom",
            message: "Güncelleme için en az bir alan göndermelisiniz.",
        });
    }
    // 3) paidAmount ve contractAmount birlikte gönderildiyse aşmama kuralı
    /*if (
      typeof data.paidAmount === "number" &&
      typeof data.contractAmount === "number" &&
      data.paidAmount > data.contractAmount
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["paidAmount"],
        message: "Ödenen tutar, sözleşme tutarını aşamaz.",
      });
    }*/
});
