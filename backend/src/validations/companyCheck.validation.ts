import { z } from "zod";
import { CheckTypeEnum } from "./enums";

export const checkCreateSchema = z
  .object({
    checkNo: z
      .string({ required_error: "Çek numarası zorunludur." })
      .trim()
      .min(1, "Çek numarası zorunludur."),

    checkDate: z.coerce.date({
      //invalid_type_error: "Geçerli bir çek tarihi giriniz.",
      required_error: "Çek tarihi zorunludur.",
    }),

    firm: z
      .string({ required_error: "Firma adı zorunludur." })
      .trim()
      .min(2, "Firma adı en az 2 karakter olmalıdır."),

    amount: z.coerce
      .number({
        required_error: "Tutar zorunludur.",
        invalid_type_error: "Tutar sayısal olmalıdır.",
      })
      .positive("Tutar pozitif olmalıdır."),

    bankId: z
      .string({ required_error: "Banka hesabı zorunludur." })
      .uuid("Sistemde olan geçerli bir banka hesabı giriniz."),

    type: CheckTypeEnum, // "PAYMENT" | "COLLECTION"

    projectId: z.string().uuid("Geçerli bir proje giriniz.").optional(),

    description: z.string().trim().optional(),

    status: z
      .enum(["PENDING", "PAID", "COLLECTED", "CANCELLED", "RETURNED", "NOTDUE", "PARTIAL"])
      .optional()
      .default("PENDING"),

    dueDate: z.coerce.date({
      //invalid_type_error: "Geçerli bir vade tarihi giriniz.",
      required_error: "Vade tarihi zorunludur.",
    }),
  })
  .superRefine((data, ctx) => {
    // dueDate >= checkDate
    if (data.dueDate.getTime() < data.checkDate.getTime()) {
      ctx.addIssue({
        code: "custom",
        path: ["dueDate"],
        message: "Vade tarihi, çek tarihinden önce olamaz.",
      });
    }
  });

export const checkUpdateSchema = z
  .object({
    checkNo: z.string().trim().min(1, "Çek numarası boş olamaz.").optional(),

    checkDate: z
      .coerce
      .date({ invalid_type_error: "Geçerli bir çek tarihi giriniz." })
      .optional(),

    firm: z.string().trim().min(2, "Firma adı en az 2 karakter olmalıdır.").optional(),

    amount: z.coerce
      .number({ invalid_type_error: "Tutar sayısal olmalıdır." })
      .positive("Tutar pozitif olmalıdır.")
      .optional(),

    bankCode: z.string().trim().min(1, "Banka kodu boş olamaz.").optional(),

    type: CheckTypeEnum.optional(),

    projectId: z.string().uuid("Geçerli bir proje ID’si giriniz.").optional(),

    description: z.string().trim().optional(),

    status: z
      .enum(["PENDING", "PAID", "COLLECTED", "CANCELLED", "RETURNED", "NOTDUE", "PARTIAL"])
      .optional(),

    dueDate: z
      .coerce
      .date({ invalid_type_error: "Geçerli bir vade tarihi giriniz." })
      .optional(),
  })
  .superRefine((data, ctx) => {
    // checkDate & dueDate birlikte verilmişse: dueDate >= checkDate
    if (data.checkDate && data.dueDate && data.dueDate.getTime() < data.checkDate.getTime()) {
      ctx.addIssue({
        code: "custom",
        path: ["dueDate"],
        message: "Vade tarihi, çek tarihinden önce olamaz.",
      });
    }
  });