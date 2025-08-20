"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stockUpdateSchema = exports.stockCreateSchema = void 0;
// validations/stock.ts
const zod_1 = require("zod");
/**
 * CompanyStock - CREATE
 * - name, category, unit: zorunlu + trim
 * - quantity >= 0, minimumQuantity >= 0
 * - stockDate (opsiyonel) tarih tipine çevrilir ve gelecekte olamaz
 * - projectId (opsiyonel) uuid
 * - location (opsiyonel) makul uzunlukta
 */
exports.stockCreateSchema = zod_1.z
    .object({
    name: zod_1.z
        .string({ required_error: "Stok adı zorunludur." })
        .trim()
        .min(1, "Stok adı boş olamaz.")
        .max(150, "Stok adı 150 karakteri aşamaz."),
    category: zod_1.z
        .string({ required_error: "Kategori zorunludur." })
        .trim()
        .min(1, "Kategori boş olamaz.")
        .max(100, "Kategori 100 karakteri aşamaz."),
    unit: zod_1.z
        .string({ required_error: "Birim zorunludur." })
        .trim()
        .min(1, "Birim boş olamaz.")
        .max(30, "Birim 30 karakteri aşamaz."),
    description: zod_1.z.string().trim().max(1000, "Açıklama 1000 karakteri aşamaz.").optional(),
    quantity: zod_1.z
        .coerce
        .number({ invalid_type_error: "Miktar sayısal olmalıdır." })
        .min(0, "Miktar negatif olamaz.")
        .default(0)
        .optional(),
    minimumQuantity: zod_1.z
        .coerce
        .number({ invalid_type_error: "Minimum miktar sayısal olmalıdır." })
        .min(0, "Minimum miktar negatif olamaz.")
        .default(0)
        .optional(),
    location: zod_1.z.string().trim().max(150, "Lokasyon 150 karakteri aşamaz.").optional(),
    stockDate: zod_1.z
        .coerce
        .date({ invalid_type_error: "Geçerli bir stok tarihi giriniz." })
        .optional(),
    projectId: zod_1.z.string().uuid("Geçerli bir proje ID giriniz.").optional(),
})
    .superRefine((data, ctx) => {
    // Stok tarihi gelecekte olamaz (bugün dahil)
    if (data.stockDate) {
        const now = new Date();
        if (data.stockDate.getTime() > now.getTime()) {
            ctx.addIssue({
                code: "custom",
                path: ["stockDate"],
                message: "Stok tarihi gelecekte olamaz.",
            });
        }
    }
    // Kod üretimi için slug kaynakları boşluk dışı karakter içermeli.
    const nameCompact = data.name?.replace(/\s+/g, "");
    const catCompact = data.category?.replace(/\s+/g, "");
    if (!nameCompact) {
        ctx.addIssue({
            code: "custom",
            path: ["name"],
            message: "Stok adı yalnızca boşluklardan oluşamaz.",
        });
    }
    if (!catCompact) {
        ctx.addIssue({
            code: "custom",
            path: ["category"],
            message: "Kategori yalnızca boşluklardan oluşamaz.",
        });
    }
});
exports.stockUpdateSchema = zod_1.z
    .object({
    name: zod_1.z
        .string()
        .trim()
        .min(1, "Stok adı boş olamaz.")
        .max(150, "Stok adı 150 karakteri aşamaz.")
        .optional(),
    category: zod_1.z
        .string()
        .trim()
        .min(1, "Kategori boş olamaz.")
        .max(100, "Kategori 100 karakteri aşamaz.")
        .optional(),
    description: zod_1.z
        .string()
        .trim()
        .max(1000, "Açıklama 1000 karakteri aşamaz.")
        .optional(),
    unit: zod_1.z
        .string()
        .trim()
        .min(1, "Birim boş olamaz.")
        .max(30, "Birim 30 karakteri aşamaz.")
        .optional(),
    quantity: zod_1.z
        .coerce
        .number({ invalid_type_error: "Miktar sayısal olmalıdır." })
        .min(0, "Miktar negatif olamaz.")
        .optional(),
    minimumQuantity: zod_1.z
        .coerce
        .number({ invalid_type_error: "Minimum miktar sayısal olmalıdır." })
        .min(0, "Minimum miktar negatif olamaz.")
        .optional(),
    location: zod_1.z
        .string()
        .trim()
        .max(150, "Lokasyon 150 karakteri aşamaz.")
        .optional(),
    stockDate: zod_1.z
        .coerce
        .date({ invalid_type_error: "Geçerli bir stok tarihi giriniz." })
        .optional(),
    // null gelirse projeyi kaldıracağız; string-uuid gelirse ilişkilendirilecek
    projectId: zod_1.z.union([zod_1.z.string().uuid("Geçerli bir proje ID giriniz."), zod_1.z.null()]).optional(),
})
    .superRefine((data, ctx) => {
    // En az bir alan gönderilmiş mi? (Opsiyonel ama faydalı)
    if (Object.keys(data).length === 0) {
        ctx.addIssue({
            code: "custom",
            message: "Güncellemek için en az bir alan göndermelisiniz.",
            path: [],
        });
    }
    // İsim/kategori sadece boşluk olamaz (gönderildiyse)
    if (data.name !== undefined && data.name.replace(/\s+/g, "") === "") {
        ctx.addIssue({
            code: "custom",
            path: ["name"],
            message: "Stok adı yalnızca boşluklardan oluşamaz.",
        });
    }
    if (data.category !== undefined && data.category.replace(/\s+/g, "") === "") {
        ctx.addIssue({
            code: "custom",
            path: ["category"],
            message: "Kategori yalnızca boşluklardan oluşamaz.",
        });
    }
    // Stok tarihi gelecekte olamaz (gönderildiyse)
    if (data.stockDate) {
        const now = new Date();
        if (data.stockDate.getTime() > now.getTime()) {
            ctx.addIssue({
                code: "custom",
                path: ["stockDate"],
                message: "Stok tarihi gelecekte olamaz.",
            });
        }
    }
    // İstersen: minimumQuantity > quantity ise uyarı/hata (ikisi birlikte geldiyse)
    if (typeof data.minimumQuantity === "number" &&
        typeof data.quantity === "number" &&
        data.minimumQuantity > data.quantity) {
        // iş kuralına göre ya uyarı ya hata; burada hata veriyoruz:
        ctx.addIssue({
            code: "custom",
            path: ["minimumQuantity"],
            message: "Minimum miktar, mevcut miktardan büyük olamaz.",
        });
    }
});
