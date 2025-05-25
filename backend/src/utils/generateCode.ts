import { AppDataSource } from "../config/data-source";
import { CompanyStock } from "../entities/CompanyStock";
import { EntityManager } from "typeorm";
import { ProjectSupplier } from "../entities/ProjectSupplier"; // ya da ProjectSubcontractor
import { ProjectSubcontractor } from "../entities/ProjectSubcontractor";

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

/*export function generateNextEntityCode(
  latestCode: string | null,
  projectCode: string,
  category: string,
  typePrefix: "TED" | "TAS", 
): string {
  const projectSuffix = projectCode.split("-")[1].toUpperCase(); // BAD002
  const categoryPrefix = category.trim().slice(0, 3).toUpperCase();
  const fullPrefix = `${projectSuffix}-${typePrefix}-${categoryPrefix}`;

  if (!latestCode || !latestCode.startsWith(fullPrefix)) {
    return `${fullPrefix}001`;
  }

  const numPart = latestCode.replace(fullPrefix, "");
  const nextNum = (parseInt(numPart) + 1).toString().padStart(3, "0");

  return `${fullPrefix}${nextNum}`;
}*/

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
