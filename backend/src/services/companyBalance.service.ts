import { AppDataSource } from "../config/data-source";
import { CompanyBalance } from "../entities/CompanyBalance";
import { generateNextBalanceCode } from "../utils/generateCode";
import { Company } from "../entities/Company";
import { EntityManager } from "typeorm";

const balanceRepo = AppDataSource.getRepository(CompanyBalance);

export const createBalance = async (
  data: {
    name: string;
    amount: number;
    currency: string;
  },
  currentUser: {
    userId: string;
    companyId: string;
  },
  manager: EntityManager = AppDataSource.manager
) => {
  const balanceRepo = manager.getRepository(CompanyBalance);
  const prefix = data.name.slice(0, 3).toUpperCase();

  const latest = await balanceRepo
    .createQueryBuilder("balance")
    .where("balance.code LIKE :prefix", { prefix: `${prefix}%` })
    .orderBy("balance.code", "DESC")
    .limit(1)
    .getOne();

  const code = generateNextBalanceCode(latest?.code ?? null, prefix);

  const balance = balanceRepo.create({
    code,
    name: data.name,
    amount: data.amount,
    currency: data.currency,
    company: { id: currentUser.companyId },
    createdBy: currentUser.userId,
    updatedBy: currentUser.userId,
  });

  return await balanceRepo.save(balance);
};

export const updateBalance = async (
  id: string,
  fields: Partial<CompanyBalance>,
  updatedBy: string
): Promise<CompanyBalance | null> => {
  try {
    const balance = await balanceRepo.findOne({ where: { id } });
    if (!balance) return null;

    Object.assign(balance, fields);
    balance.updatedBy = updatedBy;

    return await balanceRepo.save(balance);
  } catch (error) {
    console.error("❌ [updateBalance] error:", error);
    throw new Error("Bakiye güncellenemedi.");
  }
};

export const deleteBalance = async (id: number): Promise<boolean> => {
  try {
    const result = await balanceRepo.delete(id);
    return result.affected !== 0;
  } catch (error) {
    console.error("❌ [deleteBalance] error:", error);
    throw new Error("Bakiye silinemedi.");
  }
};

export const getCompanyBalances = async (
  currentUser: { companyId: string },
  query: {
    name?:string;
    currency?:string;
    code?:string
  }
) => {
  const conditions: string[] = [`companyId = $1`];
  const params: any[] = [currentUser.companyId];

  if (query.name) {
    conditions.push(`"name" = $${params.length + 1}`);
    params.push(query.name);
  }

  if (query.currency) {
    conditions.push(`currency = $${params.length + 1}`);
    params.push(query.currency);
  }

  if (query.code) {
    conditions.push(`code = $${params.length + 1}`);
    params.push(query.code);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const sql = `
    SELECT *
    FROM artikonsept.v_companybalances
    ${whereClause.toLowerCase()}
  `;

  return await AppDataSource.manager.query(sql, params);
};
