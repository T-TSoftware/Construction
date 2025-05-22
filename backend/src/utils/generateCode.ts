import { AppDataSource } from "../config/data-source";
import { CompanyStock } from "../entities/CompanyStock";
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

export function generateNextEntityCode(
  latestCode: string | null,
  projectCode: string,
  category: string,
  typePrefix: "TED" | "TAS" // 👈 sadece bu değişiyor
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
}
export const generateStockCode = async (category: string): Promise<string> => {
  const compaynStockRepo = AppDataSource.getRepository(CompanyStock);

  const prefix = `STK-${category.toUpperCase()}`;
  const latest = await compaynStockRepo
    .createQueryBuilder("item")
    .where("item.code LIKE :prefix", { prefix: `${prefix}-%` })
    .orderBy("item.code", "DESC")
    .getOne();

  const lastNumber = latest ? parseInt(latest.code.split("-")[2]) : 0;

  const nextNumber = (lastNumber + 1).toString().padStart(3, "0");

  return `${prefix}-${nextNumber}`;
};
