import { z } from "zod";
import { DirectionEnum, ItemTypeEnum } from "./enums";

// yardımcı: string'i upper'a çevirip enum'a pipe'lamak için
const toUpper = (v: unknown) => (typeof v === "string" ? v.toUpperCase() : v);

export const barterAgreementItemCreateSchema = z
  .object({
    direction: z
      .string({ required_error: "Girdi/Çıktı zorunludur." })
      .transform(toUpper)
      .pipe(DirectionEnum),

    itemType: z
      .string({ required_error: "Kalem türü zorunludur." })
      .transform(toUpper)
      .pipe(ItemTypeEnum),

    description: z
      .string({ required_error: "Açıklama zorunludur." })
      .trim()
      .min(1, "Açıklama boş olamaz."),

    agreedValue: z.coerce
      .number({ required_error: "Mutabık değer zorunludur." })
      .positive("Mutabık değer pozitif olmalıdır."),

    relatedStockCode: z.string().trim().optional(),
    relatedSubcontractorId: z
      .string()
      .uuid("Geçerli bir taşeron işi giriniz.")
      .optional(),
    relatedSupplierCode: z.string().trim().optional(),
    assetDetails: z.record(z.any()).optional(), // serbest obje
  })
  .superRefine((data, ctx) => {
    const { itemType } = data;

    // STOCK → relatedStockCode zorunlu, diğer related alanlar yasak
    if (itemType === "STOCK") {
      /*if (!data.relatedStockCode || data.relatedStockCode.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["relatedStockCode"],
          message: "STOCK için relatedStockCode zorunludur.",
        });
      }*/
      if (data.relatedSubcontractorId) {
        ctx.addIssue({
          code: "custom",
          path: ["relatedSubcontractorId"],
          message: "Stok kaleminde taşeron referansı kullanılamaz.",
        });
      }
      if (data.relatedSupplierCode) {
        ctx.addIssue({
          code: "custom",
          path: ["relatedSupplierCode"],
          message: "Stok kaleminde tedarikçi referansı kullanılamaz.",
        });
      }
      if (data.assetDetails) {
        ctx.addIssue({
          code: "custom",
          path: ["assetDetails"],
          message: "Stok kaleminde assetDetails kullanılamaz.",
        });
      }
    }

    // SERVICE → tam olarak biri zorunlu: relatedSubcontractorId XOR relatedSupplierCode
    if (itemType === "SERVICE") {
      const hasSub = !!data.relatedSubcontractorId;
      const hasSup = !!data.relatedSupplierCode;
      if (hasSub === hasSup) {
        ctx.addIssue({
          code: "custom",
          path: ["relatedSubcontractorId"],
          message:
            "Servis için taşeron işi veya tedarik bilgisinden tam olarak biri verilmelidir.",
        });
      }
      if (data.relatedStockCode) {
        ctx.addIssue({
          code: "custom",
          path: ["relatedStockCode"],
          message: "Servis kaleminde stok referansı kullanılamaz.",
        });
      }
      if (data.assetDetails) {
        ctx.addIssue({
          code: "custom",
          path: ["assetDetails"],
          message: "Servis kaleminde kullanılamaz.",
        });
      }
    }

    // ASSET → assetDetails zorunlu ve boş olmamalı
    if (itemType === "ASSET") {
      const det = data.assetDetails;
      const isEmptyObj =
        det &&
        typeof det === "object" &&
        !Array.isArray(det) &&
        Object.keys(det).length === 0;

      if (!det || isEmptyObj) {
        ctx.addIssue({
          code: "custom",
          path: ["assetDetails"],
          message: "ASSET için assetDetails zorunludur ve boş olamaz.",
        });
      }
      if (data.relatedStockCode) {
        ctx.addIssue({
          code: "custom",
          path: ["relatedStockCode"],
          message: "ASSET kaleminde stok referansı kullanılamaz.",
        });
      }
      if (data.relatedSubcontractorId) {
        ctx.addIssue({
          code: "custom",
          path: ["relatedSubcontractorId"],
          message: "ASSET kaleminde taşeron referansı kullanılamaz.",
        });
      }
      if (data.relatedSupplierCode) {
        ctx.addIssue({
          code: "custom",
          path: ["relatedSupplierCode"],
          message: "ASSET kaleminde tedarikçi referansı kullanılamaz.",
        });
      }
    }

    // CASH → hiçbir related alan verilmemeli
    if (itemType === "CASH") {
      if (
        data.relatedStockCode ||
        data.relatedSubcontractorId ||
        data.relatedSupplierCode ||
        data.assetDetails
      ) {
        ctx.addIssue({
          code: "custom",
          message: "Nakit kaleminde referans alanları kullanılamaz.",
        });
      }
    }

    // CHECK → şimdilik ek kural yok, istersen burada da bağlayabilirsin
  });