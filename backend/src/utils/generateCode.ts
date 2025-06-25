import { AppDataSource } from "../config/data-source";
import { DataSource } from "typeorm";
import { CompanyStock } from "../entities/CompanyStock";
import { EntityManager } from "typeorm";
import { ProjectSupplier } from "../entities/ProjectSupplier"; // ya da ProjectSubcontractor
import { ProjectSubcontractor } from "../entities/ProjectSubcontractor";
import { CompanyFinanceTransaction } from "../entities/CompanyFinance";
import { CompanyOrder } from "../entities/CompanyOrder";

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

export const generateStockCode = async (
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
};

export const generateNextEntityCode = async (
  manager: EntityManager,
  projectCode: string,
  category: string,
  typePrefix: "TED" | "TAS", // TED = Tedarikçi, TAS = Taşeron
  entity: "ProjectSupplier" | "ProjectSubcontractor" // ✅ Entity tipi
): Promise<string> => {
  const repo =
    entity === "ProjectSupplier"
      ? manager.getRepository(ProjectSupplier)
      : manager.getRepository(ProjectSubcontractor);

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
