// validations/projectQuantity.ts
import { z } from "zod";

// (İstersen sabit birim listesi kullan)
const ALLOWED_UNITS = [
  "ADET",
  "M",
  "M2",
  "M3",
  "KG",
  "TON",
  "GÜN",
  "SAAT",
  "PAKET",
  "KOLİ",
  "LİTRE",
] as const;

export const projectQuantityCreateSchema = z
  .object({
    projectId: z
      .string({ required_error: "Proje zorunludur." })
      .uuid("Geçerli bir proje ID giriniz."),

    // Serviste zorunlu gibi kullanılıyor (boş string olmasın)
    /*
    quantityItemCode: z
      .string({ required_error: "Metraj kalemi kodu zorunludur." })
      .trim()
      .min(1, "Metraj kalemi kodu boş olamaz.")
      // kod formatını makul sınırlayalım (isteğe bağlı)
      .regex(/^[A-Za-z0-9._-]+$/, "Kod yalnızca harf, rakam, nokta, alt/orta çizgi içerebilir."),
    */

    quantity: z.coerce
      .number({
        required_error: "Miktar zorunludur.",
        invalid_type_error: "Miktar sayısal olmalıdır.",
      })
      .positive("Miktar sıfırdan büyük olmalıdır."),

    unit: z
      .string({ required_error: "Birim zorunludur." })
      .trim()
      .min(1, "Birim boş olamaz.")
      .max(20, "Birim 20 karakteri aşamaz.")
      .transform((v) => v.toUpperCase()),
    // sabit liste kullanmak istersen aşağıdaki satırı aktif et
    //.refine((u) => (ALLOWED_UNITS as readonly string[]).includes(u), "Geçerli bir birim giriniz.")
    category: z
      .string({ required_error: "Kategori zorunludur." })
      .trim()
      .min(1, "Kategori boş olamaz.")
      .max(100, "Kategori 100 karakteri aşamaz."),

    description: z
      .string()
      .trim()
      .max(500, "Açıklama 500 karakteri aşamaz.")
      .optional(),
  })
  .superRefine((data, ctx) => {
    // Yalnızca boşluk gönderimini engelle (zaten min(1) var ama fazladan koruma)
    if (data.category.replace(/\s+/g, "") === "") {
      ctx.addIssue({
        code: "custom",
        path: ["category"],
        message: "Kategori yalnızca boşluklardan oluşamaz.",
      });
    }

    // quantity mantığı (örn. çok büyük sayı uyarısı — opsiyonel)
    if (data.quantity > 1_000_000_000) {
      ctx.addIssue({
        code: "custom",
        path: ["quantity"],
        message: "Miktar olağandışı derecede yüksek görünüyor.",
      });
    }
  });
