"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeeUpdateSchema = exports.employeeCreateSchema = void 0;
const zod_1 = require("zod");
const enums_1 = require("./enums");
exports.employeeCreateSchema = zod_1.z
    .object({
    firstName: zod_1.z
        .string({ required_error: "Ad zorunludur." })
        .trim()
        .min(1, "Ad boş olamaz."),
    lastName: zod_1.z
        .string({ required_error: "Soyad zorunludur." })
        .trim()
        .min(1, "Soyad boş olamaz."),
    age: zod_1.z
        .coerce
        .number({ invalid_type_error: "Yaş sayısal olmalıdır." })
        .int("Yaş tam sayı olmalıdır.")
        .min(18, "Yaş en az 18 olmalıdır.")
        .max(80, "Yaş en fazla 80 olabilir.")
        .optional(),
    startDate: zod_1.z.coerce.date({
        required_error: "İşe başlama tarihi zorunludur.",
        invalid_type_error: "Geçerli bir işe başlama tarihi giriniz.",
    }),
    netSalary: zod_1.z
        .coerce
        .number({ invalid_type_error: "Net maaş sayısal olmalıdır." })
        .min(0, "Net maaş negatif olamaz.")
        .optional(),
    grossSalary: zod_1.z
        .coerce
        .number({ invalid_type_error: "Brüt maaş sayısal olmalıdır." })
        .min(0, "Brüt maaş negatif olamaz.")
        .optional(),
    position: zod_1.z
        .string({ required_error: "Pozisyon zorunludur." })
        .trim()
        .min(1, "Pozisyon boş olamaz."),
    department: zod_1.z
        .string({ required_error: "Departman zorunludur." })
        .trim()
        .min(1, "Departman boş olamaz."),
    projectCodes: zod_1.z
        .array(zod_1.z
        .string({ invalid_type_error: "Proje kodu geçersiz." })
        .trim()
        .min(1, "Proje kodu boş olamaz."))
        .optional(),
})
    .superRefine((data, ctx) => {
    // startDate gelecekte olmasın (istersen kapatabilirsin)
    /*const now = new Date();
    if (data.startDate.getTime() > now.getTime()) {
      ctx.addIssue({
        code: "custom",
        path: ["startDate"],
        message: "İşe başlama tarihi gelecekte olamaz.",
      });
    }*/
    // net & gross birlikte geliyorsa: gross >= net
    if (data.netSalary !== undefined && data.grossSalary !== undefined) {
        if (Number(data.grossSalary) < Number(data.netSalary)) {
            ctx.addIssue({
                code: "custom",
                path: ["grossSalary"],
                message: "Brüt maaş, net maaştan küçük olamaz.",
            });
        }
    }
    // projectCodes duplicate kontrolü
    if (data.projectCodes && !(0, enums_1.uniqueArray)(data.projectCodes)) {
        ctx.addIssue({
            code: "custom",
            path: ["projectCodes"],
            message: "Projeler tekrar içeremez.",
        });
    }
});
exports.employeeUpdateSchema = zod_1.z
    .object({
    firstName: zod_1.z.string().trim().min(1, "Ad boş olamaz.").optional(),
    lastName: zod_1.z.string().trim().min(1, "Soyad boş olamaz.").optional(),
    age: zod_1.z
        .coerce
        .number({ invalid_type_error: "Yaş sayısal olmalıdır." })
        .int("Yaş tam sayı olmalıdır.")
        .min(18, "Yaş en az 18 olmalıdır.")
        .max(80, "Yaş en fazla 80 olabilir.")
        .optional(),
    startDate: zod_1.z
        .coerce
        .date({ invalid_type_error: "Geçerli bir işe başlama tarihi giriniz." })
        .optional(),
    netSalary: zod_1.z
        .coerce
        .number({ invalid_type_error: "Net maaş sayısal olmalıdır." })
        .min(0, "Net maaş negatif olamaz.")
        .optional(),
    grossSalary: zod_1.z
        .coerce
        .number({ invalid_type_error: "Brüt maaş sayısal olmalıdır." })
        .min(0, "Brüt maaş negatif olamaz.")
        .optional(),
    position: zod_1.z.string().trim().min(1, "Pozisyon boş olamaz.").optional(),
    department: zod_1.z.string().trim().min(1, "Departman boş olamaz.").optional(),
    paidLeaveAmount: zod_1.z
        .coerce
        .number({ invalid_type_error: "Yıllık izin sayısal olmalıdır." })
        .min(0, "Yıllık izin negatif olamaz.")
        .optional(),
    unpaidLeaveAmount: zod_1.z
        .coerce
        .number({ invalid_type_error: "Ücretsiz izin sayısal olmalıdır." })
        .min(0, "Ücretsiz izin negatif olamaz.")
        .optional(),
    sickLeaveAmount: zod_1.z
        .coerce
        .number({ invalid_type_error: "Raporlu izin sayısal olmalıdır." })
        .min(0, "Raporlu izin negatif olamaz.")
        .optional(),
    roadLeaveAmount: zod_1.z
        .coerce
        .number({ invalid_type_error: "Yol izni sayısal olmalıdır." })
        .min(0, "Yol izni negatif olamaz.")
        .optional(),
    excuseLeaveAmount: zod_1.z
        .coerce
        .number({ invalid_type_error: "Mazeret izni sayısal olmalıdır." })
        .min(0, "Mazeret izni negatif olamaz.")
        .optional(),
    projectCodes: zod_1.z
        .array(zod_1.z
        .string({ invalid_type_error: "Proje kodu geçersiz." })
        .trim()
        .min(1, "Proje kodu boş olamaz."))
        .optional(),
})
    .superRefine((data, ctx) => {
    // startDate gelecekte olmasın (verildiyse)
    /*if (data.startDate) {
      const now = new Date();
      if (data.startDate.getTime() > now.getTime()) {
        ctx.addIssue({
          code: "custom",
          path: ["startDate"],
          message: "İşe başlama tarihi gelecekte olamaz.",
        });
      }
    }*/
    // net & gross birlikte verildiyse: gross >= net
    if (data.netSalary !== undefined && data.grossSalary !== undefined) {
        if (Number(data.grossSalary) < Number(data.netSalary)) {
            ctx.addIssue({
                code: "custom",
                path: ["grossSalary"],
                message: "Brüt maaş, net maaştan küçük olamaz.",
            });
        }
    }
    // projectCodes duplicate kontrolü
    if (data.projectCodes && !(0, enums_1.uniqueArray)(data.projectCodes)) {
        ctx.addIssue({
            code: "custom",
            path: ["projectCodes"],
            message: "Projeler tekrar içeremez.",
        });
    }
});
