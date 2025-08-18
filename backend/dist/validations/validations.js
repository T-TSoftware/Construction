"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.financeTransactionSchema = exports.stockItemPatchSchema = exports.stockItemSchema = exports.stockSchema = exports.supplierSchema = void 0;
//validation.ts
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
exports.financeTransactionSchema = zod_1.z.object({
    type: zod_1.z.string().min(1, "Kayıt Tipi Zorunludur"),
    amount: zod_1.z
        .number({ required_error: "Miktar Zorunludur" })
        .positive("Miktar Pozitif Olmalıdır"),
    currency: zod_1.z.string().min(1, "Kur Bilgisi Zorunludur"),
    fromAccountCode: zod_1.z.string().min(1, "İşlem Yapılacak Hesap Zorunludur"),
    toAccountCode: zod_1.z.string().optional(), // sadece TRANSFER için geçerli
    targetType: zod_1.z.string().optional(),
    targetId: zod_1.z.string().optional(),
    targetName: zod_1.z.string().optional(),
    transactionDate: zod_1.z.coerce.date({
        errorMap: () => ({ message: "Geçerli İşlem Tarihi giriniz" }),
    }),
    method: zod_1.z.string().min(1, "Method zorunludur"),
    category: zod_1.z.string().min(1, "Kategori zorunludur"),
    invoiceYN: zod_1.z.enum(["Y", "N"]).optional().default("N"),
    invoiceCode: zod_1.z.string().optional(),
    //checkCode: z.string().optional(),
    description: zod_1.z.string().optional(),
    projectId: zod_1.z.string().optional(),
    source: zod_1.z.string().optional(),
});
/***********************BARTER ITEM************************/
/***********************CHECK************************/
/***********************EMPLOYEE************************/
/***********************EMPLOYEE LEAVE************************/
/***********************COMPANY FINANCE TRANSACTION************************/ 
