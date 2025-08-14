const trMap: Record<string, string> = {
  ç: "c", Ç: "C", ğ: "g", Ğ: "G", ı: "i", I: "I", İ: "I",
  ö: "o", Ö: "O", ş: "s", Ş: "S", ü: "u", Ü: "U",
};

const normalizeTR = (s: string) =>
  s.replace(/[çÇğĞıİöÖşŞüÜ]/g, (ch) => trMap[ch] || ch);

export const slug = (s: string) =>
  normalizeTR(s ?? "")
    .trim()
    .replace(/\s+/g, "-")         // çoklu boşluğu tek tire
    .replace(/[^A-Za-z0-9-_]/g, "") // harf/rakam/dash/altçizgi dışını at
    .replace(/-+/g, "-");   