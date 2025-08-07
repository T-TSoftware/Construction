"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSaveWithUniqueConstraint = void 0;
const generatedFieldMessages = {
    "CompanyLoanPayment.code": "Bu taksit numarası için daha önce kayıt oluşturulmuş.",
    "CompanyLoan.code": "Bu kredi zaten kayıtlı.",
    "CompanyStock.code": "Bu stok zaten kayıtlı.",
    "ProjectSubcontractor.projectid_category_unit": "Bu proje için aynı kategori ve birim kombinasyonuna sahip bir metrajdan gelen taşeron kaydı zaten mevcut.",
    // ...
};
const handleSaveWithUniqueConstraint = async (saveFn, entityName, defaultMessage = "Kayıt oluşturulurken bir hata oluştu.") => {
    try {
        return await saveFn();
    }
    catch (error) {
        if (error.code === "23505") {
            const detail = error.detail || "";
            const match = detail.match(/\(([^)]+)\)=\(([^)]+)\)/);
            const columnString = match?.[1]; // örn: "projectid, category, unit"
            const columns = columnString?.split(",").map((c) => c.trim()) ?? [];
            const key = `${entityName}.${columns.join("_")}`;
            console.log("generated key:", key);
            const message = generatedFieldMessages[key];
            if (message)
                throw new Error(message);
            throw new Error("Bu değer(ler) zaten kullanılıyor.");
        }
        throw new Error(defaultMessage);
    }
};
exports.handleSaveWithUniqueConstraint = handleSaveWithUniqueConstraint;
