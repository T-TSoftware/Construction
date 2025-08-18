// src/validations/enums.ts
import { z } from "zod";

/*BARTER RELATED*/
export const CounterpartyType = z.enum([
  "SUPPLIER",
  "SUBCONTRACTOR",
  "CUSTOMER",
  "EXTERNAL",
]);

export const BarterStatus = z.enum([
  "DRAFT",
  "PROPOSED",
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
]);

/*BARTER ITEM REALTED*/
export const DirectionEnum = z.enum(["IN", "OUT"], {
  errorMap: (issue, ctx) => {
    if (issue.code === "invalid_enum_value") {
      return {
        message: "Geçersiz değer. 'Girdi' veya 'Çıktı' olmalıdır.",
      };
    }
    return { message: ctx.defaultError };
  },
});

export const ItemTypeEnum = z.enum(
  ["STOCK", "SERVICE", "ASSET", "CASH", "CHECK"],
  {
    errorMap: (issue, ctx) => {
      if (issue.code === "invalid_enum_value") {
        return {
          message:
            "Geçersiz kalem türü. Geçerli değerler: Stok, Servis, ASSET, Nakit, Çek.",
        };
      }
      return { message: ctx.defaultError };
    },
  }
);

/*CHECK RELATED */
export const CheckTypeEnum = z.enum(["PAYMENT", "COLLECTION"], {
  errorMap: () => ({
    message: "İşlem tipi yalnızca Ödeme veya Tahsilat olabilir.",
  }),
});

/*EMPLOYEE/LEAVE RELATED. ARRAY FOR PROJECTS IN EMP. */
export const uniqueArray = <T>(arr: T[]) =>
  Array.from(new Set(arr)).length === arr.length;

export const LeaveTypeEnum = z.enum(
  ["PAID", "UNPAID", "SICK", "ROAD", "EXCUSE"],
  {
    errorMap: (issue, ctx) => {
      if (issue.code === "invalid_enum_value") {
        return {
          message:
            "Geçersiz izin türü. Geçerli değerler: Yıllık Ücretli, Yıllık Ücretsiz, Hastalık, Yol, Mazaret.",
        };
      }
      return { message: ctx.defaultError };
    },
  }
);

/*COMPANY FINANCE TRANSACTION*/
export const TypeEnum = z.enum(["PAYMENT", "COLLECTION", "TRANSFER"], {
  required_error: "İşlem tipi zorunludur.",
});

export const invoiceYNEnum = z.enum(["Y", "N"]).optional().default("N");

/** Referans kodu zorunlu olan kategoriler (servisin branch’lerine göre) */
export const CATEGORIES_NEED_REF = new Set([
  "ORDER",
  "CHECK",
  "LOAN",
  "SUBCONTRACTOR",
  "SUPPLIER",
  "BARTER",
] as const);
