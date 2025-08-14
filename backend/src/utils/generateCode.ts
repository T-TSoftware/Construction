import { AppDataSource } from "../config/data-source";
import { DataSource } from "typeorm";
import { CompanyStock } from "../entities/CompanyStock";
import { EntityManager } from "typeorm";
import { ProjectSupplier } from "../entities/ProjectSupplier"; // ya da ProjectSubcontractor
import { ProjectSubcontractor } from "../entities/ProjectSubcontractor";
import { CompanyBarterAgreement } from "../entities/CompanyBarterAgreement";
import { CompanyFinanceTransaction } from "../entities/CompanyFinance";
import { CompanyOrder } from "../entities/CompanyOrder";
import { CompanyBarterAgreementItem } from "../entities/CompanyBarterAgreementItem";

export function generateNextCompanyCode(
  latestCode: string | null,
  name: string
): string {
  const prefix = name.slice(0, 3).toUpperCase();
  if (!latestCode || !latestCode.startsWith(prefix)) return `${prefix}001`;

  const num = parseInt(latestCode.replace(prefix, ""));
  const nextNum = (num + 1).toString().padStart(3, "0");
  return `${prefix}${nextNum}`;
}

export function generateNextBalanceCode(
  latestCode: string | null,
  name: string
): string {
  const prefix = name.slice(0, 3).toUpperCase();
  if (!latestCode || !latestCode.startsWith(prefix)) return `${prefix}001`;

  const num = parseInt(latestCode.replace(prefix, ""));
  const nextNum = (num + 1).toString().padStart(3, "0");
  return `${prefix}${nextNum}`;
}

export function generateUserCode(
  companyCode: string,
  userName: string
): string {
  const companyPart = companyCode.slice(0, 3).toUpperCase().padEnd(3, "_");
  const userPart = userName.slice(0, 3).toUpperCase().padEnd(3, "_");
  return `${companyPart}-${userPart}`;
}

export function generateNextEstimatedCostCode(
  latestCode: string | null,
  projectCode: string,
  costName: string
): string {
  const giderPrefix = costName.slice(0, 3).toUpperCase();
  const prefix = `${projectCode}-${giderPrefix}`;

  if (!latestCode || !latestCode.startsWith(prefix)) {
    return `${prefix}001`;
  }

  const num = parseInt(latestCode.replace(prefix, ""));
  const nextNum = (num + 1).toString().padStart(3, "0");

  return `${prefix}${nextNum}`;
}

export function generateNextProjectCode(
  latestCode: string | null,
  companyCode: string,
  projectSite: string
): string {
  const companyPrefix = companyCode.slice(0, 3).toUpperCase();
  const projectPrefix = projectSite
    .trim()
    .split(" ")[0]
    .slice(0, 3)
    .toUpperCase();
  const fullPrefix = `${companyPrefix}-${projectPrefix}`;

  if (!latestCode || !latestCode.startsWith(fullPrefix)) {
    return `${fullPrefix}001`;
  }

  const numPart = latestCode.replace(fullPrefix, "");
  const nextNum = (parseInt(numPart) + 1).toString().padStart(3, "0");

  return `${fullPrefix}${nextNum}`;
}

/*export const generateStockCode = async (
  category: string,
  manager: EntityManager = AppDataSource.manager
): Promise<string> => {
  //const compaynStockRepo = AppDataSource.getRepository(CompanyStock);
  const stockRepo = manager.getRepository(CompanyStock);
  const prefix = `STK-${category.toUpperCase()}`;
  const latest = await stockRepo
    .createQueryBuilder("item")
    .where("item.code LIKE :prefix", { prefix: `${prefix}-%` })
    .orderBy("item.code", "DESC")
    .getOne();

  const lastNumber = latest ? parseInt(latest.code.split("-")[2]) : 0;

  const nextNumber = (lastNumber + 1).toString().padStart(3, "0");

  return `${prefix}-${nextNumber}`;
};*/

export const generateNextEntityCode = async (
  manager: EntityManager,
  projectCode: string,
  category: string,
  typePrefix: "TED" | "TAS" | "BRT", // TED = Tedarikçi, TAS = Taşeron, BRT = Barter
  entity: "ProjectSupplier" | "ProjectSubcontractor" | "CompanyBarterAgreement"
): Promise<string> => {
  const repo = (() => {
    switch (entity) {
      case "ProjectSupplier":
        return manager.getRepository(ProjectSupplier);
      case "ProjectSubcontractor":
        return manager.getRepository(ProjectSubcontractor);
      case "CompanyBarterAgreement":
        return manager.getRepository(CompanyBarterAgreement);
      default:
        throw new Error("Unknown entity type.");
    }
  })();

  const projectSuffix = projectCode.split("-")[1].toUpperCase();
  const categoryPrefix = category.trim().slice(0, 3).toUpperCase();
  const fullPrefix = `${projectSuffix}-${typePrefix}-${categoryPrefix}`;

  const latest = await repo
    .createQueryBuilder("e")
    .where("e.code LIKE :prefix", { prefix: `${fullPrefix}%` })
    .orderBy("e.code", "DESC")
    .getOne();

  const nextNumber = latest
    ? (parseInt(latest.code.replace(fullPrefix, "")) + 1)
        .toString()
        .padStart(3, "0")
    : "001";

  return `${fullPrefix}${nextNumber}`;
};

/*export const generateFinanceTransactionCode = async (
  type: "PAYMENT" | "COLLECTION" | "TRANSFER",
  transactionDate: Date,
  manager: DataSource["manager"]
): Promise<string> => {
  const prefixMap = {
    PAYMENT: "PAY",
    COLLECTION: "COL",
    TRANSFER: "TRF",
  };

  const typeCode = prefixMap[type];
  const now = new Date();

  // MMDDYYYY formatı
  const datePart = `${(now.getMonth() + 1).toString().padStart(2, "0")}${now
    .getDate()
    .toString()
    .padStart(2, "0")}${now.getFullYear()}`;

  const prefix = `${typeCode}-${datePart}`;

  const repo = manager.getRepository(CompanyFinanceTransaction);

  const latest = await repo
    .createQueryBuilder("trx")
    .where("trx.code LIKE :prefix", { prefix: `${prefix}-%` })
    .orderBy("trx.code", "DESC")
    .getOne();

  const lastNumber = latest
    ? parseInt(latest.code.split("-")[2])
    : 0;

  const nextNumber = (lastNumber + 1).toString().padStart(4, "0");

  return `${prefix}-${nextNumber}`;
};*/

export const generateFinanceTransactionCode = async (
  type: "PAYMENT" | "COLLECTION" | "TRANSFER",
  transactionDate: Date,
  manager: EntityManager,
  direction?: "IN" | "OUT" // only for TRANSFER
): Promise<string> => {
  const date = new Date(transactionDate);
  const datePart = `${(date.getMonth() + 1).toString().padStart(2, "0")}${date
    .getDate()
    .toString()
    .padStart(2, "0")}${date.getFullYear()}`;

  let prefix = "";

  if (type === "TRANSFER") {
    if (!direction)
      throw new Error("TRANSFER type requires a direction (IN or OUT).");
    prefix = direction === "OUT" ? `TRFOUT-${datePart}` : `TRFIN-${datePart}`;
  } else {
    const prefixMap = {
      PAYMENT: "PAY",
      COLLECTION: "COL",
    };
    prefix = `${prefixMap[type]}-${datePart}`;
  }

  const repo = manager.getRepository(CompanyFinanceTransaction);

  const latest = await repo
    .createQueryBuilder("trx")
    .where("trx.code LIKE :prefix", { prefix: `${prefix}-%` })
    .orderBy("trx.code", "DESC")
    .getOne();

  const lastNumber = latest ? parseInt(latest.code.split("-")[2]) : 0;
  const nextNumber = (lastNumber + 1).toString().padStart(4, "0");

  return `${prefix}-${nextNumber}`;
};

export const generateNextOrderCode = async ({
  companyId,
  reference, // projectName ya da stockCategory
  manager,
}: {
  companyId: string;
  reference: string;
  manager: EntityManager;
}): Promise<string> => {
  const today = new Date();
  const datePart = `${String(today.getMonth() + 1).padStart(2, "0")}${String(
    today.getDate()
  ).padStart(2, "0")}${today.getFullYear()}`;

  const prefix = `SAT-${reference.toUpperCase()}-${datePart}`;

  const repo = manager.getRepository(CompanyOrder);

  const latest = await repo
    .createQueryBuilder("order")
    .where("order.companyid = :companyId AND order.code LIKE :prefix", {
      companyId,
      prefix: `${prefix}-%`,
    })
    .orderBy("order.code", "DESC")
    .getOne();

  const lastNumber = latest ? parseInt(latest.code.split("-").pop()!) : 0;
  const nextNumber = (lastNumber + 1).toString().padStart(3, "0");

  return `${prefix}-${nextNumber}`;
};

export const generateNextBarterAgreementItemCode = async (
  manager: EntityManager,
  barterAgreementCode: string,
  itemType: "STOCK" | "SERVICE" | "ASSET" | "CASH" | "CHECK"
): Promise<string> => {
  const repo = manager.getRepository(CompanyBarterAgreementItem);

  // İngilizce → Türkçe tam karşılık
  const itemTypeMap: Record<typeof itemType, string> = {
    STOCK: "STOK",
    SERVICE: "HİZMET",
    ASSET: "VARLIK",
    CASH: "NAKİT",
    CHECK: "ÇEK"
  };

  const labelTR = itemTypeMap[itemType];
  if (!labelTR) {
    throw new Error(`Geçersiz itemType: ${itemType}`);
  }

  const prefix = `${barterAgreementCode}-${labelTR}`;

  const latest = await repo
    .createQueryBuilder("item")
    .where("item.code LIKE :prefix", { prefix: `${prefix}%` })
    .orderBy("item.code", "DESC")
    .getOne();

  const nextNumber = latest
    ? (parseInt(latest.code.replace(prefix, "")) + 1).toString().padStart(3, "0")
    : "001";

  return `${prefix}${nextNumber}`;
};


/**
 * Format:  {projectCode}-BRT-{TYPE}{###}
 * Ex:         İZM001-BRT-SUP001
 * TYPE map:    SUPPLIER→SUP, SUBCONTRACTOR→TAS, CUSTOMER→CUS, EXTERNAL→EXT
 */

const CounterpartyLabel: Record<string, string> = {
  SUPPLIER: "TEDARIK",
  SUBCONTRACTOR: "TASERON",
  CUSTOMER: "MUSTERI",
  EXTERNAL: "HARICI",
};
export async function generateNextBarterCode(
  manager: EntityManager,
  params: {
    companyId: string;
    projectCode: string;            // ör: İZM001
    counterpartyType: string;      // İngilizce gelecek, ör: SUPPLIER
  }
): Promise<string> {
  const { companyId, projectCode, counterpartyType } = params;

  // İngilizce → Türkçe çeviri
  const labelTR = CounterpartyLabel[counterpartyType.toUpperCase()];
  if (!labelTR) {
    throw new Error(`Geçersiz counterpartyLabel: ${counterpartyType}`);
  }

  const prefix = `${projectCode.toUpperCase()}-BRT-${labelTR}`;
  const repo = manager.getRepository(CompanyBarterAgreement);

  // 🔎 En son numarayı, aynı şirket içinde tara:
  const latest = await repo
    .createQueryBuilder("a")
    .where("a.companyid = :cid", { cid: companyId })
    .andWhere("a.code LIKE :prefix", { prefix: `${prefix}%` })
    .orderBy("a.code", "DESC")
    .getOne();

  const nextNum = (() => {
    if (!latest?.code) return 1;
    const m = latest.code.match(/(\d+)$/);
    return m ? parseInt(m[1], 10) + 1 : 1;
  })();

  return `${prefix}${String(nextNum).padStart(3, "0")}`;
}
