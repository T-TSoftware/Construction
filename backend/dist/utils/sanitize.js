"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeEntity = void 0;
/** Basit tip mi? (derine inmeye gerek yok) */
const isPlainValue = (v) => v === null ||
    v === undefined ||
    typeof v === "string" ||
    typeof v === "number" ||
    typeof v === "boolean" ||
    v instanceof Date;
/** Dizi mi? */
const isArray = Array.isArray;
/** Objeden alan seç/çıkar */
const projectFields = (obj, rule) => {
    if (!obj || typeof obj !== "object")
        return obj;
    if (rule.include && rule.include.length > 0) {
        const out = {};
        for (const k of rule.include) {
            if (k in obj)
                out[k] = obj[k];
        }
        return out;
    }
    if (rule.exclude && rule.exclude.length > 0) {
        const out = {};
        for (const k of Object.keys(obj)) {
            if (!rule.exclude.includes(k))
                out[k] = obj[k];
        }
        return out;
    }
    // include/exclude verilmemişse aynen geç
    return { ...obj };
};
/** İlişkileri (nested) sanitize et */
const sanitizeRelations = (obj, rule, map) => {
    if (!rule.relations)
        return obj;
    const out = { ...obj };
    for (const [prop, subSchema] of Object.entries(rule.relations)) {
        if (!(prop in out))
            continue;
        const value = out[prop];
        if (value == null)
            continue;
        // subSchema string verildiyse o entity adını kullan
        const subRule = typeof subSchema === "string" ? map[subSchema] : subSchema;
        if (!subRule) {
            // şema yoksa aynen geç
            continue;
        }
        if (isArray(value)) {
            out[prop] = value.map((item) => (0, exports.sanitizeEntity)(item, subRule, map));
        }
        else {
            out[prop] = (0, exports.sanitizeEntity)(value, subRule, map);
        }
    }
    return out;
};
/** Çekirdek sanitize */
const sanitizeEntity = (entity, ruleOrName, map) => {
    if (entity == null)
        return entity;
    // Dizi geldiyse her elemanı sanitize et
    if (isArray(entity)) {
        return entity.map((e) => (0, exports.sanitizeEntity)(e, ruleOrName, map));
    }
    if (isPlainValue(entity))
        return entity;
    // rule resolve
    const rule = typeof ruleOrName === "string" ? map[ruleOrName] ?? {} : ruleOrName;
    // transform (en başta uygula)
    const transformed = rule.transform ? rule.transform(entity) : entity;
    // include/exclude uygula
    const projected = projectFields(transformed, rule);
    // relations uygula
    const nested = sanitizeRelations(projected, rule, map);
    return nested;
};
exports.sanitizeEntity = sanitizeEntity;
