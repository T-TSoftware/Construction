import { AppDataSource } from "../config/data-source";
import { CompanyBalance } from "../entities/CompanyBalance";
import { generateNextBalanceCode } from "../utils/generateCode";
import { Company } from "../entities/Company";
import { CompanyBalanceView } from "../views/CompanyBalanceView";

const balanceRepo = AppDataSource.getRepository(CompanyBalance);
const viewRepo = AppDataSource.getRepository(CompanyBalanceView);

export const getCompanyBalances = async (companyId: string) => {
  try {
    const all = await viewRepo.findBy({ companyId });
    return all.map(({ code, name, amount, currency }) => ({
      code,
      name,
      amount,
      currency,
    }));
  } catch (error) {
    console.error("❌ [getCompanyBalances] error:", error);
    throw new Error("Bakiye bilgileri alınamadı.");
  }
};

export const createBalance = async (
  companyId: string,
  name: string,
  amount: number,
  currency: string,
  createdBy: string
): Promise<CompanyBalance> => {
  try {
    const prefix = name.slice(0, 3).toUpperCase();

    const latest = await balanceRepo
      .createQueryBuilder("balance")
      .where("balance.code LIKE :prefix", { prefix: `${prefix}%` })
      .orderBy("balance.code", "DESC")
      .limit(1)
      .getOne();

    const code = generateNextBalanceCode(latest?.code ?? null, prefix);

    const balance = balanceRepo.create({
      code,
      company: { id: companyId } as unknown as Company,
      name,
      amount,
      currency,
      createdBy,
      updatedBy: createdBy,
    });

    return await balanceRepo.save(balance);
  } catch (error) {
    console.error("❌ [createBalance] error:", error);
    throw new Error("Bakiye oluşturulamadı.");
  }
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
