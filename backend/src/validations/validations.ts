//validation.ts
import { z } from "zod";
import {
  BarterStatus,
  CATEGORIES_NEED_REF,
  CheckTypeEnum,
  CounterpartyType,
  DirectionEnum,
  invoiceYNEnum,
  ItemTypeEnum,
  LeaveTypeEnum,
  TypeEnum,
  uniqueArray,
} from "./enums";

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
  //code: z.string().min(1, "Stok kodu zorunludur."),
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

export const financeTransactionSchema = z.object({
  type: z.string().min(1, "Kayıt Tipi Zorunludur"),
  amount: z
    .number({ required_error: "Miktar Zorunludur" })
    .positive("Miktar Pozitif Olmalıdır"),
  currency: z.string().min(1, "Kur Bilgisi Zorunludur"),

  fromAccountCode: z.string().min(1, "İşlem Yapılacak Hesap Zorunludur"),
  toAccountCode: z.string().optional(), // sadece TRANSFER için geçerli

  targetType: z.string().optional(),
  targetId: z.string().optional(),
  targetName: z.string().optional(),

  transactionDate: z.coerce.date({
    errorMap: () => ({ message: "Geçerli İşlem Tarihi giriniz" }),
  }),

  method: z.string().min(1, "Method zorunludur"),
  category: z.string().min(1, "Kategori zorunludur"),

  invoiceYN: z.enum(["Y", "N"]).optional().default("N"),
  invoiceCode: z.string().optional(),
  //checkCode: z.string().optional(),
  description: z.string().optional(),

  projectId: z.string().optional(),
  source: z.string().optional(),
});

/***********************BARTER ITEM************************/


/***********************CHECK************************/


/***********************EMPLOYEE************************/


/***********************EMPLOYEE LEAVE************************/



/***********************COMPANY FINANCE TRANSACTION************************/