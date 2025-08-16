// utils/persist.ts
import { handleSaveWithUniqueConstraint } from "./errorHandler";
import { sanitizeEntity } from "./sanitize";
import type { SanitizeMap } from "./sanitize";

type SaveAndReturnOptions<T> = {
  entityName: string;             // sanitize & error map için
  save: () => Promise<T>;         // repo.save(...) çağrısı
  refetch: () => Promise<any>;    // relations ile tekrar seç
  rules: SanitizeMap;             // sanitize kuralların
  defaultError?: string;          // opsiyonel
};

export async function saveRefetchSanitize<T>({
  entityName,
  save,
  refetch,
  rules,
  defaultError = "Kayıt oluşturulurken bir hata oluştu.",
}: SaveAndReturnOptions<T>) {
  // 1) Unique hataları tek yerden yakala
  await handleSaveWithUniqueConstraint(save, entityName, defaultError);

  // 2) İlişkilerle tekrar fetch et (sanitize ilişki yüklemez)
  const full = await refetch();

  // 3) Sanitize et ve dön
  return sanitizeEntity(full, entityName, rules);
}

export const normalize = (s?: string) => {
  return (s ?? "")
    .normalize("NFD")                       // harfleri ve aksanları ayırır
    .replace(/[\u0300-\u036f]/g, "")         // aksanları kaldırır
    .replace(/ğ/g, "g")
    .replace(/Ğ/g, "G")
    .replace(/ü/g, "u")
    .replace(/Ü/g, "U")
    .replace(/ş/g, "s")
    .replace(/Ş/g, "S")
    .replace(/ı/g, "i")
    .replace(/İ/g, "I")
    .replace(/ö/g, "o")
    .replace(/Ö/g, "O")
    .replace(/ç/g, "c")
    .replace(/Ç/g, "C")
    .replace(/\s+/g, "")                     // tüm boşlukları kaldır
    .replace(/[^a-zA-Z0-9]/g, "")            // harf ve rakam dışındaki her şeyi kaldır
    .toUpperCase();
};