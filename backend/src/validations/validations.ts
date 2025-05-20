import { z } from "zod";

export const supplierSchema = z.object({
  quantityItemCode: z.string().min(1, "quantityItemCode boş olamaz"),
  category: z.string().min(1, "category boş olamaz"),
  companyName: z.string().optional(),
  unit: z.string().min(1, "unit boş olamaz"),
  unitPrice: z.number().positive().optional(),
  quantity: z.number().positive().optional(),
  contractAmount: z.number().positive().optional(),
  paidAmount: z.number().nonnegative().optional(),
  status: z.string().optional(),
  description: z.string().optional(),
});

export const stockSchema = z.object({
  code: z.string().min(1, "Stok kodu zorunludur."),
  name: z.string().min(1, "Stok adı zorunludur."),
  category: z.string().min(1, "Kategori zorunludur."),
  unit: z.string().min(1, "Birim zorunludur."),
  description: z.string().optional(),
  quantity: z.number().positive("Miktar pozitif olmalı.").optional(),
  minimumQuantity: z
    .number()
    .nonnegative("Minimum miktar negatif olamaz.")
    .optional(),
  location: z.string().optional(),
  stockDate: z.coerce.date().optional(),
  projectId: z.string().uuid().optional(),
});

export const stockItemSchema = z.object({
  name: z.string().min(1, "Stok adı zorunludur."),
  category: z.string().min(1, "Kategori zorunludur."),
  unit: z.string().min(1, "Birim zorunludur."),
  description: z.string().optional(),
});

// ✅ PATCH için ayrı ve esnek şema
export const stockItemPatchSchema = stockItemSchema.partial();