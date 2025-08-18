import { z } from "zod";
import { uniqueArray } from "./enums";

export const employeeCreateSchema = z
  .object({
    firstName: z
      .string({ required_error: "Ad zorunludur." })
      .trim()
      .min(1, "Ad boş olamaz."),
    lastName: z
      .string({ required_error: "Soyad zorunludur." })
      .trim()
      .min(1, "Soyad boş olamaz."),

    age: z
      .coerce
      .number({ invalid_type_error: "Yaş sayısal olmalıdır." })
      .int("Yaş tam sayı olmalıdır.")
      .min(18, "Yaş en az 18 olmalıdır.")
      .max(80, "Yaş en fazla 80 olabilir.")
      .optional(),

    startDate: z.coerce.date({
      required_error: "İşe başlama tarihi zorunludur.",
      invalid_type_error: "Geçerli bir işe başlama tarihi giriniz.",
    }),

    netSalary: z
      .coerce
      .number({ invalid_type_error: "Net maaş sayısal olmalıdır." })
      .min(0, "Net maaş negatif olamaz.")
      .optional(),

    grossSalary: z
      .coerce
      .number({ invalid_type_error: "Brüt maaş sayısal olmalıdır." })
      .min(0, "Brüt maaş negatif olamaz.")
      .optional(),

    position: z
      .string({ required_error: "Pozisyon zorunludur." })
      .trim()
      .min(1, "Pozisyon boş olamaz."),

    department: z
      .string({ required_error: "Departman zorunludur." })
      .trim()
      .min(1, "Departman boş olamaz."),

    projectCodes: z
      .array(
        z
          .string({ invalid_type_error: "Proje kodu geçersiz." })
          .trim()
          .min(1, "Proje kodu boş olamaz.")
      )
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
    if (data.projectCodes && !uniqueArray(data.projectCodes)) {
      ctx.addIssue({
        code: "custom",
        path: ["projectCodes"],
        message: "Projeler tekrar içeremez.",
      });
    }
  });

export const employeeUpdateSchema = z
  .object({
    firstName: z.string().trim().min(1, "Ad boş olamaz.").optional(),
    lastName: z.string().trim().min(1, "Soyad boş olamaz.").optional(),

    age: z
      .coerce
      .number({ invalid_type_error: "Yaş sayısal olmalıdır." })
      .int("Yaş tam sayı olmalıdır.")
      .min(18, "Yaş en az 18 olmalıdır.")
      .max(80, "Yaş en fazla 80 olabilir.")
      .optional(),

    startDate: z
      .coerce
      .date({ invalid_type_error: "Geçerli bir işe başlama tarihi giriniz." })
      .optional(),

    netSalary: z
      .coerce
      .number({ invalid_type_error: "Net maaş sayısal olmalıdır." })
      .min(0, "Net maaş negatif olamaz.")
      .optional(),

    grossSalary: z
      .coerce
      .number({ invalid_type_error: "Brüt maaş sayısal olmalıdır." })
      .min(0, "Brüt maaş negatif olamaz.")
      .optional(),

    position: z.string().trim().min(1, "Pozisyon boş olamaz.").optional(),
    department: z.string().trim().min(1, "Departman boş olamaz.").optional(),

    paidLeaveAmount: z
      .coerce
      .number({ invalid_type_error: "Yıllık izin sayısal olmalıdır." })
      .min(0, "Yıllık izin negatif olamaz.")
      .optional(),

    unpaidLeaveAmount: z
      .coerce
      .number({ invalid_type_error: "Ücretsiz izin sayısal olmalıdır." })
      .min(0, "Ücretsiz izin negatif olamaz.")
      .optional(),

    sickLeaveAmount: z
      .coerce
      .number({ invalid_type_error: "Raporlu izin sayısal olmalıdır." })
      .min(0, "Raporlu izin negatif olamaz.")
      .optional(),

    roadLeaveAmount: z
      .coerce
      .number({ invalid_type_error: "Yol izni sayısal olmalıdır." })
      .min(0, "Yol izni negatif olamaz.")
      .optional(),

    excuseLeaveAmount: z
      .coerce
      .number({ invalid_type_error: "Mazeret izni sayısal olmalıdır." })
      .min(0, "Mazeret izni negatif olamaz.")
      .optional(),

    projectCodes: z
      .array(
        z
          .string({ invalid_type_error: "Proje kodu geçersiz." })
          .trim()
          .min(1, "Proje kodu boş olamaz.")
      )
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
    if (data.projectCodes && !uniqueArray(data.projectCodes)) {
      ctx.addIssue({
        code: "custom",
        path: ["projectCodes"],
        message: "Projeler tekrar içeremez.",
      });
    }
  });