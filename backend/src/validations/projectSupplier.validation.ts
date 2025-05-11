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
