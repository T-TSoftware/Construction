"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectCreateSchema = void 0;
// validations/project.ts
const zod_1 = require("zod");
// İstersen sabitleyebilirsin:
const StatusEnum = zod_1.z.enum(["PLANNED", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"]);
exports.projectCreateSchema = zod_1.z
    .object({
    name: zod_1.z
        .string({ required_error: "Proje adı zorunludur." })
        .trim()
        .min(2, "Proje adı en az 2 karakter olmalıdır.")
        .max(120, "Proje adı 120 karakteri aşamaz."),
    site: zod_1.z
        .string({ required_error: "Şantiye/konum bilgisi zorunludur." })
        .trim()
        .min(1, "Şantiye/konum bilgisi boş olamaz.")
        .max(200, "Şantiye/konum bilgisi 200 karakteri aşamaz."),
    // Status opsiyonel; gönderilirse normalize et
    status: zod_1.z
        .string()
        .trim()
        .transform((v) => v.toUpperCase())
        .pipe(StatusEnum.optional())
        .optional(),
    estimatedStartDate: zod_1.z.coerce.date({
        required_error: "Planlanan başlangıç tarihi zorunludur.",
        invalid_type_error: "Planlanan başlangıç tarihi geçersiz.",
    }),
    estimatedEndDate: zod_1.z.coerce.date({
        required_error: "Planlanan bitiş tarihi zorunludur.",
        invalid_type_error: "Planlanan bitiş tarihi geçersiz.",
    }),
    actualStartDate: zod_1.z
        .coerce
        .date({ invalid_type_error: "Gerçek başlangıç tarihi geçersiz." })
        .optional(),
    actualEndDate: zod_1.z
        .coerce
        .date({ invalid_type_error: "Gerçek bitiş tarihi geçersiz." })
        .optional(),
})
    .superRefine((data, ctx) => {
    // 1) Planlanan bitiş >= planlanan başlangıç
    if (data.estimatedEndDate.getTime() < data.estimatedStartDate.getTime()) {
        ctx.addIssue({
            code: "custom",
            path: ["estimatedEndDate"],
            message: "Planlanan bitiş tarihi, planlanan başlangıç tarihinden önce olamaz.",
        });
    }
    // 2) Gerçek tarihler (varsa) kendi içinde tutarlı olsun
    if (data.actualStartDate && data.actualEndDate) {
        if (data.actualEndDate.getTime() < data.actualStartDate.getTime()) {
            ctx.addIssue({
                code: "custom",
                path: ["actualEndDate"],
                message: "Gerçek bitiş tarihi, gerçek başlangıç tarihinden önce olamaz.",
            });
        }
    }
    // 3) (Opsiyonel) Gerçek başlangıç, planlanan başlangıçtan çok önce olmasın vb.
    // if (data.actualStartDate && data.actualStartDate.getTime() < data.estimatedStartDate.getTime()) {
    //   ctx.addIssue({
    //     code: "custom",
    //     path: ["actualStartDate"],
    //     message: "Gerçek başlangıç tarihi, planlanan başlangıçtan daha erken olamaz.",
    //   });
    // }
    // 4) İsim tek boşluk olmayan karakterlerden oluşsun (kod üretimiyle uyum)
    const compact = data.name.replace(/\s+/g, "");
    if (compact.length === 0) {
        ctx.addIssue({
            code: "custom",
            path: ["name"],
            message: "Proje adı yalnızca boşluklardan oluşamaz.",
        });
    }
});
