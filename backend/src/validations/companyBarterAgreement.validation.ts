import { z } from "zod";
import { BarterStatus, CounterpartyType } from "./enums";

export const barterCreateSchema = z
  .object({
    projectId: z
      .string({ required_error: "Proje zorunludur." })
      .uuid("Geçerli bir proje ID giriniz."),

    counterpartyType: CounterpartyType, // servis zaten upper-case bekliyor

    counterpartyId: z
      .string()
      .uuid("Geçerli bir karşı taraf giriniz.")
      .optional(),

    counterpartyName: z
      .string({ required_error: "Karşı taraf adı zorunludur." })
      .trim()
      .min(1, "Karşı taraf adı zorunludur."),

    /*agreementDate: z.coerce
      .date({ invalid_type_error: "Geçerli bir anlaşma tarihi giriniz." }),*/
    agreementDate: z.any(),

    status: BarterStatus.default("ACTIVE"),

    description: z.string().trim().optional(),

    totalOurValue: z.coerce
      .number({ invalid_type_error: "Bizim değerimiz sayısal olmalıdır." })
      .min(0, "Bizim değerimiz negatif olamaz.")
      .optional()
      .default(0),

    totalTheirValue: z.coerce
      .number({ invalid_type_error: "Karşı taraf değeri sayısal olmalıdır." })
      .min(0, "Karşı taraf değeri negatif olamaz.")
      .optional()
      .default(0),
  })
  .superRefine((data, ctx) => {
    if (data.agreementDate) {
      const date = new Date(data.agreementDate);
      const now = new Date();
      if (date.getTime() > now.getTime()) {
        ctx.addIssue({
          code: "custom",
          path: ["agreementDate"],
          message: "Anlaşma tarihi gelecekte olamaz.",
        });
      }
    }

    // COMPLETED ise makul bir iş kuralı: en az bir total > 0 olsun
    /*if (data.status === "COMPLETED") {
      const our = Number(data.totalOurValue ?? 0);
      const their = Number(data.totalTheirValue ?? 0);
      if (our <= 0 && their <= 0) {
        ctx.addIssue({
          code: "custom",
          message:
            "COMPLETED için totalOurValue veya totalTheirValue pozitif olmalı.",
          path: ["totalOurValue"],
        });
      }
    }*/
  });

export const barterUpdateSchema = z
  .object({
    projectId: z.string().uuid("Geçerli bir proje giriniz.").optional(),

    counterpartyType: CounterpartyType.optional(),

    counterpartyId: z
      .string()
      .uuid("Geçerli bir karşı taraf ID giriniz.")
      .optional(),

    counterpartyName: z
      .string()
      .trim()
      .min(1, "Karşı taraf adı boş olamaz.")
      .optional(),

    /*agreementDate: z.coerce
      .date({ invalid_type_error: "Geçerli bir anlaşma tarihi giriniz." })
      .optional(),*/
    agreementDate: z.any().optional(),

    status: BarterStatus.optional(),

    description: z.string().trim().optional(),

    totalOurValue: z.coerce
      .number({ invalid_type_error: "Bizim değerimiz sayısal olmalıdır." })
      .min(0, "Bizim değerimiz negatif olamaz.")
      .optional(),

    totalTheirValue: z.coerce
      .number({ invalid_type_error: "Karşı taraf değeri sayısal olmalıdır." })
      .min(0, "Karşı taraf değeri negatif olamaz.")
      .optional(),
  })
  .refine(
    (body) => Object.keys(body).length > 0, // en az bir alan güncellenmeli
    { message: "Güncellenecek en az bir alan göndermelisiniz." }
  )
  .superRefine((data, ctx) => {
    if (data.agreementDate) {
      const date = new Date(data.agreementDate);
      const now = new Date();
      if (date.getTime() > now.getTime()) {
        ctx.addIssue({
          code: "custom",
          path: ["agreementDate"],
          message: "Anlaşma tarihi gelecekte olamaz.",
        });
      }
    }

    // Status COMPLETED'e geçiyorsa (body'de status=COMPLETED geldiyse)
    /*if (data.status === "COMPLETED") {
      // Update'te mevcut değerleri bilemeyeceğimiz için en az bir total alanı body'de gelsin
      const our = data.totalOurValue;
      const their = data.totalTheirValue;
      if ((our === undefined || our <= 0) && (their === undefined || their <= 0)) {
        ctx.addIssue({
          code: "custom",
          message:
            "COMPLETED için totalOurValue veya totalTheirValue pozitif olarak gönderilmelidir.",
          path: ["status"],
        });
      }
    }*/
  });