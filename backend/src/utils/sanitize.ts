// src/utils/sanitize.ts
export type SanitizeRule = {
  include?: string[];                 // sadece bunlar kalsın (whitelist)
  exclude?: string[];                 // bunları çıkar (blacklist) - include yoksa çalışır
  relations?: Record<string, string | SanitizeRule>; // alt alanlar için şema
  transform?: (value: any) => any;    // opsiyonel özel dönüştürme
};

export type SanitizeMap = Record<string, SanitizeRule>;

/** Basit tip mi? (derine inmeye gerek yok) */
const isPlainValue = (v: any) =>
  v === null ||
  v === undefined ||
  typeof v === "string" ||
  typeof v === "number" ||
  typeof v === "boolean" ||
  v instanceof Date;

/** Dizi mi? */
const isArray = Array.isArray;

/** Objeden alan seç/çıkar */
const projectFields = (obj: any, rule: SanitizeRule) => {
  if (!obj || typeof obj !== "object") return obj;

  if (rule.include && rule.include.length > 0) {
    const out: any = {};
    for (const k of rule.include) {
      if (k in obj) out[k] = obj[k];
    }
    return out;
  }

  if (rule.exclude && rule.exclude.length > 0) {
    const out: any = {};
    for (const k of Object.keys(obj)) {
      if (!rule.exclude!.includes(k)) out[k] = obj[k];
    }
    return out;
  }

  // include/exclude verilmemişse aynen geç
  return { ...obj };
};

/** İlişkileri (nested) sanitize et */
const sanitizeRelations = (
  obj: any,
  rule: SanitizeRule,
  map: SanitizeMap
) => {
  if (!rule.relations) return obj;

  const out = { ...obj };
  for (const [prop, subSchema] of Object.entries(rule.relations)) {
    if (!(prop in out)) continue;

    const value = out[prop];
    if (value == null) continue;

    // subSchema string verildiyse o entity adını kullan
    const subRule =
      typeof subSchema === "string" ? map[subSchema] : subSchema;

    if (!subRule) {
      // şema yoksa aynen geç
      continue;
    }

    if (isArray(value)) {
      out[prop] = value.map((item) => sanitizeEntity(item, subRule, map));
    } else {
      out[prop] = sanitizeEntity(value, subRule, map);
    }
  }
  return out;
};

/** Çekirdek sanitize */
export const sanitizeEntity = (
  entity: any,
  ruleOrName: SanitizeRule | string,
  map: SanitizeMap
): any => {
  if (entity == null) return entity;

  // Dizi geldiyse her elemanı sanitize et
  if (isArray(entity)) {
    return entity.map((e) => sanitizeEntity(e, ruleOrName, map));
  }

  if (isPlainValue(entity)) return entity;

  // rule resolve
  const rule: SanitizeRule =
    typeof ruleOrName === "string" ? map[ruleOrName] ?? {} : ruleOrName;

  // transform (en başta uygula)
  const transformed = rule.transform ? rule.transform(entity) : entity;

  // include/exclude uygula
  const projected = projectFields(transformed, rule);

  // relations uygula
  const nested = sanitizeRelations(projected, rule, map);

  return nested;
};