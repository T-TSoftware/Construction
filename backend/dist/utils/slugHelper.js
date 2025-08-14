"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slug = void 0;
const trMap = {
    ç: "c", Ç: "C", ğ: "g", Ğ: "G", ı: "i", I: "I", İ: "I",
    ö: "o", Ö: "O", ş: "s", Ş: "S", ü: "u", Ü: "U",
};
const normalizeTR = (s) => s.replace(/[çÇğĞıİöÖşŞüÜ]/g, (ch) => trMap[ch] || ch);
const slug = (s) => normalizeTR(s ?? "")
    .trim()
    .replace(/\s+/g, "-") // çoklu boşluğu tek tire
    .replace(/[^A-Za-z0-9-_]/g, "") // harf/rakam/dash/altçizgi dışını at
    .replace(/-+/g, "-");
exports.slug = slug;
