"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeeLeaveUpdateSchema = exports.employeeLeaveCreateSchema = void 0;
const zod_1 = require("zod");
const enums_1 = require("./enums");
exports.employeeLeaveCreateSchema = zod_1.z
    .object({
    startDate: zod_1.z.coerce.date({
        required_error: "Başlangıç tarihi zorunludur.",
        invalid_type_error: "Geçerli bir başlangıç tarihi giriniz.",
    }),
    endDate: zod_1.z.coerce.date({
        required_error: "Bitiş tarihi zorunludur.",
        invalid_type_error: "Geçerli bir bitiş tarihi giriniz.",
    }),
    type: enums_1.LeaveTypeEnum, // "PAID" | "UNPAID" | "SICK" | "ROAD" | "EXCUSE"
    description: zod_1.z
        .string({ invalid_type_error: "Açıklama metin olmalıdır." })
        .trim()
        .max(1000, "Açıklama 1000 karakteri geçemez.")
        .optional(),
    // leaveDayCount: İSTEMEYELİM — backend zaten hesaplıyor
})
    .superRefine((data, ctx) => {
    // tarih sırası
    if (data.endDate.getTime() < data.startDate.getTime()) {
        ctx.addIssue({
            code: "custom",
            path: ["endDate"],
            message: "Bitiş tarihi, başlangıç tarihinden önce olamaz.",
        });
    }
    // en az 1 gün (hesabı kesin backend yapıyor ama bariz hatayı önden yakalayalım)
    const diffMs = data.endDate.getTime() - data.startDate.getTime();
    const day = 24 * 60 * 60 * 1000;
    const approxDays = Math.floor(diffMs / day); // (başlangıç+bitiş dahil senaryosu yaygın)
    if (approxDays <= 0) {
        ctx.addIssue({
            code: "custom",
            path: ["endDate"],
            message: "İzin süresi 0'dan büyük olmalıdır.",
        });
    }
});
exports.employeeLeaveUpdateSchema = zod_1.z
    .object({
    startDate: zod_1.z
        .coerce
        .date({ invalid_type_error: "Geçerli bir başlangıç tarihi giriniz." })
        .optional(),
    endDate: zod_1.z
        .coerce
        .date({ invalid_type_error: "Geçerli bir bitiş tarihi giriniz." })
        .optional(),
    type: enums_1.LeaveTypeEnum.optional(),
    description: zod_1.z
        .string({ invalid_type_error: "Açıklama metin olmalıdır." })
        .trim()
        .max(1000, "Açıklama 1000 karakteri geçemez.")
        .optional(),
    // leaveDayCount: yine istemiyoruz
})
    .superRefine((data, ctx) => {
    if (data.startDate && data.endDate) {
        if (data.endDate.getTime() < data.startDate.getTime()) {
            ctx.addIssue({
                code: "custom",
                path: ["endDate"],
                message: "Bitiş tarihi, başlangıç tarihinden önce olamaz.",
            });
        }
        const diffMs = data.endDate.getTime() - data.startDate.getTime();
        const day = 24 * 60 * 60 * 1000;
        const approxDays = Math.floor(diffMs / day);
        if (approxDays <= 0) {
            ctx.addIssue({
                code: "custom",
                path: ["endDate"],
                message: "İzin süresi 0 dan büyük olmalıdır.",
            });
        }
    }
    // En az bir alan gelmiş mi? (opsiyonel ama pratik)
    if (data.startDate === undefined &&
        data.endDate === undefined &&
        data.type === undefined &&
        data.description === undefined) {
        ctx.addIssue({
            code: "custom",
            message: "Güncelleme için en az bir alan göndermelisiniz.",
            path: [],
        });
    }
});
