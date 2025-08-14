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