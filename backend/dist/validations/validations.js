"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stockItemPatchSchema = exports.stockItemSchema = exports.stockSchema = exports.supplierSchema = void 0;
const zod_1 = require("zod");
exports.supplierSchema = zod_1.z.object({
    quantityItemCode: zod_1.z.string().min(1, "quantityItemCode boş olamaz"),
    category: zod_1.z.string().min(1, "category boş olamaz"),
    companyName: zod_1.z.string().optional(),
    unit: zod_1.z.string().min(1, "unit boş olamaz"),
    unitPrice: zod_1.z.number().positive().optional(),
    quantity: zod_1.z.number().positive().optional(),
    contractAmount: zod_1.z.number().positive().optional(),
    paidAmount: zod_1.z.number().nonnegative().optional(),
    status: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
});
exports.stockSchema = zod_1.z.object({
    //code: z.string().min(1, "Stok kodu zorunludur."),
    name: zod_1.z.string().min(1, "Stok adı zorunludur."),
    category: zod_1.z.string().min(1, "Kategori zorunludur."),
    unit: zod_1.z.string().min(1, "Birim zorunludur."),
    description: zod_1.z.string().optional(),
    quantity: zod_1.z.number().positive("Miktar pozitif olmalı.").optional(),
    minimumQuantity: zod_1.z
        .number()
        .nonnegative("Minimum miktar negatif olamaz.")
        .optional(),
    location: zod_1.z.string().optional(),
    stockDate: zod_1.z.coerce.date().optional(),
    projectId: zod_1.z.string().uuid().optional(),
});
exports.stockItemSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Stok adı zorunludur."),
    category: zod_1.z.string().min(1, "Kategori zorunludur."),
    unit: zod_1.z.string().min(1, "Birim zorunludur."),
    description: zod_1.z.string().optional(),
});
// ✅ PATCH için ayrı ve esnek şema
exports.stockItemPatchSchema = exports.stockItemSchema.partial();
