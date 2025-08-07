// utils/errorHandlers.ts
/*
const constraintMessages: Record<string, string> = {
  UQ_63d62bd759cf2dfef2bfd825940: "Bu taksit kodu zaten kullanılıyor. Lütfen taksit numaralarını kontrol edin.",
  UQ_projectsupplier_code: "Bu tedarik kodu daha önce kullanılmış.",
  UQ_company_code: "Bu firma kodu zaten kayıtlı.",
  // ...
};

export const handleSaveWithUniqueConstraint = async <T>(
  saveFn: () => Promise<T>,
  defaultMessage = "Kayıt oluşturulurken bir hata oluştu."
): Promise<T> => {
  try {
    return await saveFn();
  } catch (error: any) {
    if (error.code === "23505") {
      const constraint = error.constraint;
      const detail = error.detail || "";

      const mappedMessage = constraintMessages[constraint];
      if (mappedMessage) throw new Error(mappedMessage);

      // fallback olarak kolon-adı ve değer ile oluştur
      const match = detail.match(/\(([^)]+)\)=\(([^)]+)\)/);
      const column = match?.[1];
      const value = match?.[2];

      const fallback = column && value
        ? `'${column}' değeri '${value}' olan bir kayıt zaten mevcut.`
        : "Bu değer zaten kullanılıyor.";

      throw new Error(fallback);
    }

    throw new Error(defaultMessage);
  }
};*/
type UniqueViolationKey = `${string}.${string}`; // örnek: "CompanyLoanPayment.code"

const generatedFieldMessages: Record<UniqueViolationKey, string> = {
  "CompanyLoanPayment.code":
    "Bu taksit numarası için daha önce kayıt oluşturulmuş.",
  "CompanyLoan.code": "Bu kredi zaten kayıtlı.",
  "CompanyStock.code": "Bu stok zaten kayıtlı.",
  "ProjectSubcontractor.projectid_category_unit":
    "Bu proje için aynı kategori ve birim kombinasyonuna sahip bir metrajdan gelen taşeron kaydı zaten mevcut.",
  // ...
};
export const handleSaveWithUniqueConstraint = async <T>(
  saveFn: () => Promise<T>,
  entityName: string,
  defaultMessage = "Kayıt oluşturulurken bir hata oluştu."
): Promise<T> => {
  try {
    return await saveFn();
  } catch (error: any) {
    if (error.code === "23505") {
      const detail = error.detail || "";

      const match = detail.match(/\(([^)]+)\)=\(([^)]+)\)/);
      const columnString = match?.[1]; // örn: "projectid, category, unit"
      const columns =
        columnString?.split(",").map((c: string) => c.trim()) ?? [];

      const key = `${entityName}.${columns.join("_")}` as UniqueViolationKey;
      console.log("generated key:", key);

      const message = generatedFieldMessages[key];
      if (message) throw new Error(message);

      throw new Error("Bu değer(ler) zaten kullanılıyor.");
    }

    throw new Error(defaultMessage);
  }
};
