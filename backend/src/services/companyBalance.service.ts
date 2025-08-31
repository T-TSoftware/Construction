import { AppDataSource } from "../config/data-source";
import { CompanyBalance } from "../entities/CompanyBalance";
import {
  generateEntityCode,
  generateNextBalanceCode,
} from "../utils/generateCode";
import { Company } from "../entities/Company";
import { EntityManager, In } from "typeorm";
import { saveRefetchSanitize } from "../utils/persist";
import { sanitizeRules } from "../utils/sanitizeRules";
import { User } from "../entities/User";
import { sanitizeEntity } from "../utils/sanitize";

const balanceRepo = AppDataSource.getRepository(CompanyBalance);

type BalanceUpdateInput = {
  id: string;
  name?: string;
  amount?: number;
  currency?: string;
};

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

  const code = await generateEntityCode(
    manager,
    currentUser.companyId,
    "CompanyBalance"
  );

  const balance = balanceRepo.create({
    code,
    name: data.name,
    amount: data.amount,
    currency: data.currency,
    company: { id: currentUser.companyId },
    createdBy: { id: currentUser.userId },
    updatedBy: { id: currentUser.userId },
  });

  return await saveRefetchSanitize({
    entityName: "CompanyBalance",
    save: () => balanceRepo.save(balance),
    refetch: () =>
      balanceRepo.findOneOrFail({
        where: { id: balance.id, company: { id: currentUser.companyId } },
        relations: ["company", "createdBy", "updatedBy"],
      }),
    rules: sanitizeRules,
    defaultError: "Hesap kaydı oluşturulamadı.",
  });
};

export const updateBalance = async (
  id: string,
  fields: Partial<CompanyBalance>,
  currentUser: {
    userId: string;
    companyId: string;
  },
  manager: EntityManager = AppDataSource.manager
): Promise<CompanyBalance | null> => {
  try {
    const balance = await balanceRepo.findOne({
      where: { id },
      relations: ["company", "createdBy", "updatedBy"],
    });
    if (!balance) return null;

    Object.assign(balance, fields);
    balance.updatedBy = { id: currentUser.userId } as User;

    return sanitizeEntity(balance, "CompanyBalance", sanitizeRules);
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
    name?: string;
    currency?: string;
    code?: string;
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

export const updateManyCompanyBalances = async (
  manager: EntityManager,
  updates: BalanceUpdateInput[],
  currentUser: { userId: string; companyId: string }
): Promise<CompanyBalance[]> => {
  if (!Array.isArray(updates) || updates.length === 0) {
    throw new Error("Güncelleme için en az bir kayıt gönderilmelidir.");
  }

  const repo = manager.getRepository(CompanyBalance);
  const ids = updates.map((u) => u.id);

  // Mevcutları tek sorguda çek (tenant filtresiyle)
  const existing = await repo.find({
    where: { id: In(ids), company: { id: currentUser.companyId } },
    relations: ["company"],
  });

  if (existing.length !== ids.length) {
    // Hangi kayıt yok/başkasına ait, tespit etmek istersen:
    const foundIds = new Set(existing.map((e) => e.id));
    const missing = ids.filter((x) => !foundIds.has(x));
    throw new Error(
      `Bazı bakiye kayıtları bulunamadı veya yetkiniz yok. ID'ler: ${missing.join(
        ", "
      )}`
    );
  }

  // Map ile hızlı erişim
  const byId = new Map(existing.map((e) => [e.id, e]));

  // Sadece izin verilen alanları ata
  for (const patch of updates) {
    const entity = byId.get(patch.id)!;

    if (patch.name !== undefined) {
      entity.name = patch.name.trim();
    }
    if (patch.amount !== undefined) {
      entity.amount = Number(patch.amount);
    }
    if (patch.currency !== undefined) {
      entity.currency = patch.currency.trim().toUpperCase();
    }

    entity.updatedBy = { id: currentUser.userId } as User;
    // updatedatetime, @UpdateDateColumn ile otomatik güncellenir
  }

  // Toplu kaydet
  const saved = await repo.save(existing);
  return saved;
};
