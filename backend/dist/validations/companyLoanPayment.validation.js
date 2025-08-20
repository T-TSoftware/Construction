"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loanPaymentUpdateSchema = exports.loanPaymentCreateSchema = void 0;
// src/validations/loanPayment.create.ts
const zod_1 = require("zod");
const LoanPaymentStatus = zod_1.z.enum(["PENDING", "PAID", "OVERDUE"], {
    invalid_type_error: "Durum geçersiz.",
});
exports.loanPaymentCreateSchema = zod_1.z
    .object({
    // code: servis üretir, istemiyoruz
    installmentNumber: zod_1.z
        .number({
        required_error: "Taksit numarası zorunludur.",
        invalid_type_error: "Taksit numarası sayısal olmalıdır.",
    })
        .int("Taksit numarası tam sayı olmalıdır.")
        .min(1, "Taksit numarası 1 veya daha büyük olmalıdır."),
    dueDate: zod_1.z.coerce.date({
        invalid_type_error: "Geçerli bir vade tarihi giriniz.",
    }),
    // Toplam tutarı ‘principal + interest’ ile tutarlı kontrol edeceğiz
    /*totalAmount: z
      .number({
        required_error: "Taksit toplam tutarı zorunludur.",
        invalid_type_error: "Taksit toplam tutarı sayısal olmalıdır.",
      })
      .positive("Taksit toplam tutarı pozitif olmalıdır."),*/
    interestAmount: zod_1.z
        .number({
        required_error: "Faiz tutarı zorunludur.",
        invalid_type_error: "Faiz tutarı sayısal olmalıdır.",
    })
        .min(0, "Faiz tutarı negatif olamaz."),
    principalAmount: zod_1.z
        .number({
        required_error: "Anapara tutarı zorunludur.",
        invalid_type_error: "Anapara tutarı sayısal olmalıdır.",
    })
        .min(0, "Anapara tutarı negatif olamaz."),
    // Servis zaten 0’a çeviriyor; istek gelirse 0 olmasını şart koşuyoruz
    /*paymentAmount: z
      .number({ invalid_type_error: "Ödenen tutar sayısal olmalıdır." })
      .min(0, "Ödenen tutar negatif olamaz.")
      .optional(),*/
    // İlk yaratımda kalan tutar = toplam tutar (henüz ödeme yok)
    /*remainingAmount: z
      .number({
        required_error: "Kalan tutar zorunludur.",
        invalid_type_error: "Kalan tutar sayısal olmalıdır.",
      })
      .min(0, "Kalan tutar negatif olamaz."),*/
    status: LoanPaymentStatus.optional().default("PENDING"),
    paymentDate: zod_1.z
        .coerce
        .date({ invalid_type_error: "Geçerli bir ödeme tarihi giriniz." })
        .optional(),
    /*penaltyAmount: z
      .number({
        required_error: "Ceza tutarı zorunludur.",
        invalid_type_error: "Ceza tutarı sayısal olmalıdır.",
      })
      .min(0, "Ceza tutarı negatif olamaz."),*/
    description: zod_1.z.string().trim().optional(),
})
    .superRefine((data, ctx) => {
    // 1) toplam = principal + interest
    /*const sum = Number(data.principalAmount) + Number(data.interestAmount);
    if (Number(data.totalAmount) !== sum) {
      ctx.addIssue({
        code: "custom",
        path: ["totalAmount"],
        message:
          "Toplam tutar, anapara ve faiz toplamına eşit olmalıdır.",
      });
    }*/
    // 2) İlk yaratımda remainingAmount = totalAmount olmalı (servis mantığı)
    /*if (Number(data.remainingAmount) !== Number(data.totalAmount)) {
      ctx.addIssue({
        code: "custom",
        path: ["remainingAmount"],
        message:
          "İlk oluşturma için kalan tutar, toplam tutara eşit olmalıdır.",
      });
    }*/
    // 3) paymentAmount varsa 0 olmalı (servis 0'a set ediyor)
    /*if (typeof data.paymentAmount === "number" && data.paymentAmount !== 0) {
      ctx.addIssue({
        code: "custom",
        path: ["paymentAmount"],
        message:
          "İlk oluşturma için ödenen tutar 0 olmalıdır.",
      });
    }*/
    // 4) paymentDate varsa: status = PAID ve gelecekte olamaz
    /*if (data.paymentDate) {
      if (data.status !== "PAID") {
        ctx.addIssue({
          code: "custom",
          path: ["status"],
          message:
            "Ödeme tarihi verildiğinde durum PAID olmalıdır.",
        });
      }
      const now = new Date();
      if (data.paymentDate.getTime() > now.getTime()) {
        ctx.addIssue({
          code: "custom",
          path: ["paymentDate"],
          message: "Ödeme tarihi gelecekte olamaz.",
        });
      }
    }*/
    // 5) OVERDUE ancak vade geçmişse mantıklıdır (uyarı niteliğinde)
    /*if (data.status === "OVERDUE") {
      const now = new Date();
      if (data.dueDate.getTime() >= now.getTime()) {
        ctx.addIssue({
          code: "custom",
          path: ["status"],
          message:
            "Vadesi gelmemiş bir taksit OVERDUE olamaz.",
        });
      }
    }*/
    // 6) PAID ise kalan tutar 0 olmalı (mantıksal tutarlılık)
    /* if (data.status === "PAID" && Number(data.remainingAmount) !== 0) {
       ctx.addIssue({
         code: "custom",
         path: ["remainingAmount"],
         message: "Durum PAID iken kalan tutar 0 olmalıdır.",
       });
     }*/
});
// Ortak tarih helper (opsiyonel alanlar için)
const zOptDate = zod_1.z.preprocess((v) => (v === undefined || v === null ? undefined : new Date(v)), zod_1.z.date({ invalid_type_error: "Geçerli bir tarih giriniz." })).optional();
/**
 * PATCH /loan-payments/:id
 * - Her alan opsiyonel
 * - İş kuralları:
 *   • (principal + interest + penalty) ile totalAmount tutarlı olmalı (ikisi de varsa)
 *   • paymentAmount >= 0 ve (varsa) totalAmount’ı aşamaz
 *   • status = PAID ise paymentDate zorunlu; ayrıca (varsa) paymentAmount totalAmount’tan küçük olamaz
 *   • status = OVERDUE ise (varsa) dueDate bugünden ileri bir tarih olamaz
 */
exports.loanPaymentUpdateSchema = zod_1.z
    .object({
    installmentNumber: zod_1.z
        .coerce.number({ invalid_type_error: "Taksit numarası sayısal olmalıdır." })
        .int("Taksit numarası tam sayı olmalıdır.")
        .positive("Taksit numarası pozitif olmalıdır.")
        .optional(),
    dueDate: zOptDate, // "Geçerli bir tarih giriniz." mesajı gelir
    paymentDate: zOptDate,
    /*totalAmount: z
      .coerce.number({ invalid_type_error: "Toplam tutar sayısal olmalıdır." })
      .min(0, "Toplam tutar negatif olamaz.")
      .optional(),*/
    interestAmount: zod_1.z
        .coerce.number({ invalid_type_error: "Faiz tutarı sayısal olmalıdır." })
        .min(0, "Faiz tutarı negatif olamaz.")
        .optional(),
    principalAmount: zod_1.z
        .coerce.number({ invalid_type_error: "Anapara tutarı sayısal olmalıdır." })
        .min(0, "Anapara tutarı negatif olamaz.")
        .optional(),
    /*penaltyAmount: z
      .coerce.number({ invalid_type_error: "Ceza tutarı sayısal olmalıdır." })
      .min(0, "Ceza tutarı negatif olamaz.")
      .optional(),*/
    /*paymentAmount: z
      .coerce.number({ invalid_type_error: "Ödenen tutar sayısal olmalıdır." })
      .min(0, "Ödenen tutar negatif olamaz.")
      .optional(),*/
    status: LoanPaymentStatus.optional(),
    description: zod_1.z.string().trim().max(2000, "Açıklama 2000 karakteri aşamaz.").optional(),
})
    .superRefine((data, ctx) => {
    const hasParts = data.principalAmount !== undefined ||
        data.interestAmount !== undefined;
    //data.penaltyAmount !== undefined;
    // (principal + interest + penalty) ↔ totalAmount tutarlılığı
    /*if (hasParts && data.totalAmount !== undefined) {
      const sum =
        (data.principalAmount ?? 0) +
        (data.interestAmount ?? 0) +
        (data.penaltyAmount ?? 0);
    */
    // ufak ondalık farklara tolerans
    /*if (Math.abs(sum - data.totalAmount) > 0.0001) {
      ctx.addIssue({
        code: "custom",
        path: ["totalAmount"],
        message: "Toplam tutar, (anapara + faiz + ceza) toplamına eşit olmalıdır.",
      });
    }
  }*/
    // paymentAmount totalAmount’ı aşmasın (ikisi de varsa)
    /*if (data.paymentAmount !== undefined && data.totalAmount !== undefined) {
      if (data.paymentAmount > data.totalAmount) {
        ctx.addIssue({
          code: "custom",
          path: ["paymentAmount"],
          message: "Ödenen tutar, toplam tutarı aşamaz.",
        });
      }
    }*/
    // Statü özel kuralları
    /*if (data.status === "PAID") {
      // ödeme tarihi zorunlu
      if (!data.paymentDate) {
        ctx.addIssue({
          code: "custom",
          path: ["paymentDate"],
          message: "Ödeme tamamlandı (PAID) ise ödeme tarihi zorunludur.",
        });
      }

      // ödeme tutarı < toplam tutar olmasın (ikisi de sağlanıyorsa)
      if (data.paymentAmount !== undefined && data.totalAmount !== undefined) {
        if (data.paymentAmount < data.totalAmount) {
          ctx.addIssue({
            code: "custom",
            path: ["paymentAmount"],
            message: "Durum PAID iken ödenen tutar, toplam tutardan az olamaz.",
          });
        }
      }
    }*/
    /*if (data.status === "OVERDUE" && data.dueDate) {
      const today = new Date();
      // dueDate gelecekte ise OVERDUE çelişir
      if (data.dueDate.getTime() > today.getTime()) {
        ctx.addIssue({
          code: "custom",
          path: ["status"],
          message: "Vade tarihi gelecekteyken durum GECİKMEDE (OVERDUE) olamaz.",
        });
      }
    }*/
});
