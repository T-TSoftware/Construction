type UniqueViolationKey = `${string}.${string}`; // örnek: "CompanyLoanPayment.code"

const generatedFieldMessages: Record<UniqueViolationKey, string> = {
  "CompanyLoanPayment.code": "Kredi için taksit bu numarası zaten mevcut.",
  "CompanyLoan.name": "Bu isimde bir kredi zaten mevcut.",
  "CompanyStock.companyid_category_name": "Bu stok zaten mevcut.",
  "ProjectSubcontractor.projectid_category_unit":
    "Bu proje için aynı kategori ve birim kombinasyonuna sahip bir metrajdan gelen taşeron kaydı zaten mevcut.",
  "ProjectSupplier.projectid_category_unit":
    "Bu proje için aynı kategori ve birim kombinasyonuna sahip bir metrajdan gelen tedarik kaydı zaten mevcut.",
  "ProjectQuantity.companyid_projectid_category_unit":
    "Bu metraj bu proje için zaten mevcut",
  "CompanyCheck.companyid_checknumber":
    "Bu Çek Numarasıyla bir Çek zaten mevcut.",
  "CompanyEmployee.companyid_code": "Bu çalışan zaten mevcut",
  "CompanyProjects.companyid_code": "Bu proje zaten mevcut",
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
