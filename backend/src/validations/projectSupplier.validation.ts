import { z } from "zod";

/** Durum enumu – case-insensitive kabul edilecek */
const SupplierStatus = z.enum(["NEW", "AGREED", "PENDING", "CANCELLED"]);

/** Küçük yardımcılar */
const toUpperTrim = (s: string) => s.trim().toUpperCase();

export const projectSupplierCreateSchema = z
  .object({
    /*projectId: z
      .string({ required_error: "Proje zorunludur." })
      .uuid("Geçerli bir proje ID giriniz."),*/

    category: z
      .string({ required_error: "Kategori zorunludur." })
      .min(1, "Kategori boş olamaz.")
      .transform(toUpperTrim),

    companyName: z
      .string()
      .trim()
      .max(150, "Firma adı 150 karakteri aşamaz.")
      .optional(),

    unit: z
      .string({ required_error: "Birim zorunludur." })
      .min(1, "Birim boş olamaz.")
      .max(20, "Birim 20 karakteri aşamaz.")
      .transform(toUpperTrim),

    /** Sayılar string gelse bile kabul et, tür dönüşümü yap */
    unitPrice: z.coerce
      .number({ invalid_type_error: "Birim fiyat sayısal olmalıdır." })
      .positive("Birim fiyat sıfırdan büyük olmalıdır.")
      .optional(),

    quantity: z.coerce
      .number({ invalid_type_error: "Miktar sayısal olmalıdır." })
      .positive("Miktar sıfırdan büyük olmalıdır.")
      .optional(),

    contractAmount: z.coerce
      .number({ invalid_type_error: "Sözleşme tutarı sayısal olmalıdır." })
      .positive("Sözleşme tutarı sıfırdan büyük olmalıdır.")
      .optional(),

    status: z.preprocess(
      (v) => (typeof v === "string" ? v.trim().toUpperCase() : v),
      SupplierStatus
    ),

    description: z
      .string()
      .trim()
      .max(500, "Açıklama 500 karakteri aşamaz.")
      .optional(),

    projectQuantityId: z
      .string()
      .uuid("Geçerli bir metraj ID giriniz.")
      .optional(),

    addedFromQuantityYN: z
      .preprocess(
        (v) => (typeof v === "string" ? v.trim().toUpperCase() : v),
        z.enum(["Y", "N"], {
          invalid_type_error: "addedFromQuantityYN alanı Y veya N olmalıdır.",
        })
      )
      .default("N"),
  })
  .superRefine((data, ctx) => {
    // 2) unitPrice / quantity / contractAmount birlikte zorunlu
    const trio: Array<keyof typeof data> = [
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
            message:
              "Birim fiyat, miktar ve sözleşme tutarı birlikte gönderilmelidir.",
          });
        });
    }

    // 2) Metrajla ilişki kuralı (opsiyonel ama tutarlı)
    if (data.projectQuantityId && data.addedFromQuantityYN !== "Y") {
      ctx.addIssue({
        code: "custom",
        path: ["addedFromQuantityYN"],
        message:
          "projectQuantityId verildiğinde addedFromQuantityYN = 'Y' olmalıdır.",
      });
    }
    if (data.addedFromQuantityYN === "Y" && !data.projectQuantityId) {
      ctx.addIssue({
        code: "custom",
        path: ["projectQuantityId"],
        message: "addedFromQuantityYN = 'Y' ise projectQuantityId zorunludur.",
      });
    }
  });

/** Durum alanı (case-insensitive, Türkçe hata) */
const StatusCI = z
  .string({ invalid_type_error: "Durum metin olmalıdır." })
  .transform((v) => v.trim().toUpperCase())
  .refine((v) => ["NEW", "AGREED", "PENDING", "CANCELLED"].includes(v), {
    message:
      "Durum geçersiz. Geçerli değerler: NEW, AGREED, PENDING, CANCELLED.",
  });

/** ProjectSupplier UPDATE şeması */
export const projectSupplierUpdateSchema = z
  .object({
    companyName: z
      .string()
      .trim()
      .max(150, "Firma adı 150 karakteri aşamaz.")
      .optional(),

    category: z
      .string()
      .trim()
      .min(1, "Kategori boş olamaz.")
      .max(100, "Kategori 100 karakteri aşamaz.")
      .transform(toUpperTrim)
      .optional(),

    unit: z
      .string()
      .trim()
      .min(1, "Birim boş olamaz.")
      .max(20, "Birim 20 karakteri aşamaz.")
      .transform(toUpperTrim)
      .optional(),

    unitPrice: z.coerce
      .number({ invalid_type_error: "Birim fiyat sayısal olmalıdır." })
      .positive("Birim fiyat sıfırdan büyük olmalıdır.")
      .optional(),

    quantity: z.coerce
      .number({ invalid_type_error: "Miktar sayısal olmalıdır." })
      .positive("Miktar sıfırdan büyük olmalıdır.")
      .optional(),

    contractAmount: z.coerce
      .number({ invalid_type_error: "Sözleşme tutarı sayısal olmalıdır." })
      .positive("Sözleşme tutarı sıfırdan büyük olmalıdır.")
      .optional(),

    status: StatusCI.optional(),

    description: z
      .string()
      .trim()
      .max(500, "Açıklama 500 karakteri aşamaz.")
      .optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    // 1) En az bir alan gönderilmeli
    const hasAny =
      data.companyName !== undefined ||
      data.category !== undefined ||
      data.unit !== undefined ||
      data.unitPrice !== undefined ||
      data.quantity !== undefined ||
      data.contractAmount !== undefined ||
      data.status !== undefined ||
      data.description !== undefined;

    if (!hasAny) {
      ctx.addIssue({
        code: "custom",
        message: "Güncelleme için en az bir alan göndermelisiniz.",
      });
      return;
    }
  });
