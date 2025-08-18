"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CATEGORIES_NEED_REF = exports.invoiceYNEnum = exports.TypeEnum = exports.LeaveTypeEnum = exports.uniqueArray = exports.CheckTypeEnum = exports.ItemTypeEnum = exports.DirectionEnum = exports.BarterStatus = exports.CounterpartyType = void 0;
// src/validations/enums.ts
const zod_1 = require("zod");
/*BARTER RELATED*/
exports.CounterpartyType = zod_1.z.enum([
    "SUPPLIER",
    "SUBCONTRACTOR",
    "CUSTOMER",
    "EXTERNAL",
]);
exports.BarterStatus = zod_1.z.enum([
    "DRAFT",
    "PROPOSED",
    "ACTIVE",
    "COMPLETED",
    "CANCELLED",
]);
/*BARTER ITEM REALTED*/
exports.DirectionEnum = zod_1.z.enum(["IN", "OUT"], {
    errorMap: (issue, ctx) => {
        if (issue.code === "invalid_enum_value") {
            return {
                message: "Geçersiz değer. 'Girdi' veya 'Çıktı' olmalıdır.",
            };
        }
        return { message: ctx.defaultError };
    },
});
exports.ItemTypeEnum = zod_1.z.enum(["STOCK", "SERVICE", "ASSET", "CASH", "CHECK"], {
    errorMap: (issue, ctx) => {
        if (issue.code === "invalid_enum_value") {
            return {
                message: "Geçersiz kalem türü. Geçerli değerler: Stok, Servis, ASSET, Nakit, Çek.",
            };
        }
        return { message: ctx.defaultError };
    },
});
/*CHECK RELATED */
exports.CheckTypeEnum = zod_1.z.enum(["PAYMENT", "COLLECTION"], {
    errorMap: () => ({
        message: "İşlem tipi yalnızca Ödeme veya Tahsilat olabilir.",
    }),
});
/*EMPLOYEE/LEAVE RELATED. ARRAY FOR PROJECTS IN EMP. */
const uniqueArray = (arr) => Array.from(new Set(arr)).length === arr.length;
exports.uniqueArray = uniqueArray;
exports.LeaveTypeEnum = zod_1.z.enum(["PAID", "UNPAID", "SICK", "ROAD", "EXCUSE"], {
    errorMap: (issue, ctx) => {
        if (issue.code === "invalid_enum_value") {
            return {
                message: "Geçersiz izin türü. Geçerli değerler: Yıllık Ücretli, Yıllık Ücretsiz, Hastalık, Yol, Mazaret.",
            };
        }
        return { message: ctx.defaultError };
    },
});
/*COMPANY FINANCE TRANSACTION*/
exports.TypeEnum = zod_1.z.enum(["PAYMENT", "COLLECTION", "TRANSFER"], {
    required_error: "İşlem tipi zorunludur.",
});
exports.invoiceYNEnum = zod_1.z.enum(["Y", "N"]).optional().default("N");
/** Referans kodu zorunlu olan kategoriler (servisin branch’lerine göre) */
exports.CATEGORIES_NEED_REF = new Set([
    "ORDER",
    "CHECK",
    "LOAN",
    "SUBCONTRACTOR",
    "SUPPLIER",
    "BARTER",
]);
