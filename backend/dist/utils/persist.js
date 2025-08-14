"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveRefetchSanitize = saveRefetchSanitize;
// utils/persist.ts
const errorHandler_1 = require("./errorHandler");
const sanitize_1 = require("./sanitize");
async function saveRefetchSanitize({ entityName, save, refetch, rules, defaultError = "Kayıt oluşturulurken bir hata oluştu.", }) {
    // 1) Unique hataları tek yerden yakala
    await (0, errorHandler_1.handleSaveWithUniqueConstraint)(save, entityName, defaultError);
    // 2) İlişkilerle tekrar fetch et (sanitize ilişki yüklemez)
    const full = await refetch();
    // 3) Sanitize et ve dön
    return (0, sanitize_1.sanitizeEntity)(full, entityName, rules);
}
