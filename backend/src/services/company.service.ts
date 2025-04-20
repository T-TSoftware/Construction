// src/services/company.service.ts
import { AppDataSource } from "../config/data-source";
import { Company } from "../entities/Company";
import { generateNextCompanyCode } from "../utils/generateCode";

export const getAllCompanies = async (): Promise<Company[]> => {
  return await AppDataSource.getRepository(Company).find();
};

export const getCompanyById = async (id: string): Promise<Company | null> => {
  return await AppDataSource.getRepository(Company).findOneBy({ id });
};

export const createCompany = async (name: string): Promise<Company> => {
  const repo = AppDataSource.getRepository(Company);
  const prefix = name.slice(0, 3).toUpperCase();

  const latest = await repo
    .createQueryBuilder("company")
    .where("company.code LIKE :prefix", { prefix: `${prefix}%` })
    .orderBy("company.code", "DESC")
    .limit(1)
    .getOne();

  const code = generateNextCompanyCode(latest?.code ?? null, name);
  const company = repo.create({ name, code });

  return await repo.save(company);
};

export const updateCompany = async (
  id: string,
  name: string
): Promise<Company | null> => {
  const repo = AppDataSource.getRepository(Company);
  const company = await repo.findOneBy({ id });
  if (!company) return null;

  company.name = name;
  return await repo.save(company);
};

export const deleteCompany = async (id: string): Promise<boolean> => {
  const repo = AppDataSource.getRepository(Company);
  const result = await repo.delete(id);
  return result.affected === 1;
};
