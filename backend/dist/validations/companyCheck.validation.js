"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUpdateSchema = exports.checkCreateSchema = void 0;
const zod_1 = require("zod");
const enums_1 = require("./enums");
exports.checkCreateSchema = zod_1.z
    .object({
    checkNo: zod_1.z
        .string({ required_error: "Çek numarası zorunludur." })
        .trim()
        .min(1, "Çek numarası zorunludur."),
    checkDate: zod_1.z.coerce.date({
        //invalid_type_error: "Geçerli bir çek tarihi giriniz.",
        required_error: "Çek tarihi zorunludur.",
    }),
    firm: zod_1.z
        .string({ required_error: "Firma adı zorunludur." })
        .trim()
        .min(2, "Firma adı en az 2 karakter olmalıdır."),
    amount: zod_1.z.coerce
        .number({
        required_error: "Tutar zorunludur.",
        invalid_type_error: "Tutar sayısal olmalıdır.",
    })
        .positive("Tutar pozitif olmalıdır."),
    bankId: zod_1.z
        .string({ required_error: "Banka hesabı zorunludur." })
        .uuid("Sistemde olan geçerli bir banka hesabı giriniz."),
    type: enums_1.CheckTypeEnum, // "PAYMENT" | "COLLECTION"
    projectId: zod_1.z.string().uuid("Geçerli bir proje giriniz.").optional(),
    description: zod_1.z.string().trim().optional(),
    status: zod_1.z
        .enum(["PENDING", "PAID", "COLLECTED", "CANCELLED", "RETURNED", "NOTDUE", "PARTIAL"])
        .optional()
        .default("PENDING"),
    dueDate: zod_1.z.coerce.date({
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
exports.checkUpdateSchema = zod_1.z
    .object({
    checkNo: zod_1.z.string().trim().min(1, "Çek numarası boş olamaz.").optional(),
    checkDate: zod_1.z
        .coerce
        .date({ invalid_type_error: "Geçerli bir çek tarihi giriniz." })
        .optional(),
    firm: zod_1.z.string().trim().min(2, "Firma adı en az 2 karakter olmalıdır.").optional(),
    amount: zod_1.z.coerce
        .number({ invalid_type_error: "Tutar sayısal olmalıdır." })
        .positive("Tutar pozitif olmalıdır.")
        .optional(),
    bankCode: zod_1.z.string().trim().min(1, "Banka kodu boş olamaz.").optional(),
    type: enums_1.CheckTypeEnum.optional(),
    projectId: zod_1.z.string().uuid("Geçerli bir proje ID’si giriniz.").optional(),
    description: zod_1.z.string().trim().optional(),
    status: zod_1.z
        .enum(["PENDING", "PAID", "COLLECTED", "CANCELLED", "RETURNED", "NOTDUE", "PARTIAL"])
        .optional(),
    dueDate: zod_1.z
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
