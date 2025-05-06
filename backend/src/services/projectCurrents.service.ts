// src/services/projectCurrent.service.ts
import { AppDataSource } from "../config/data-source";
import { ProjectCurrent } from "../entities/ProjectCurrent";
import { CompanyProject } from "../entities/CompanyProject";
import { CompanyBalance } from "../entities/CompanyBalance";
import { User } from "../entities/User";

const projectCurrentRepo = AppDataSource.getRepository(ProjectCurrent);
const projectRepo = AppDataSource.getRepository(CompanyProject);
const balanceRepo = AppDataSource.getRepository(CompanyBalance);

export const createProjectCurrent = async (
  data: {
    projectId: string;
    balanceCode: string;
    type: string;
    amount: number;
    currency: string;
    transactionDate?: string;
    description:string;
  },
  currentUser: {
    userId: string;
  }
) => {
  // 1. Project kontrolü
  const project = await projectRepo.findOneByOrFail({ id: data.projectId });

  // 2. Balance kontrolü (code ile arıyoruz!)
  const balance = await balanceRepo.findOneByOrFail({ code: data.balanceCode.trim().toUpperCase() });

  // 3. Yeni kayıt oluştur
  const newRecord = projectCurrentRepo.create({
    project: { id: project.id },
    balance: { id: balance.id },
    type: data.type.trim(),
    amount: data.amount,
    currency: data.currency.trim().toUpperCase(),
    transactionDate: data.transactionDate?.trim(),
    description : data.description.trim(),
    createdBy: { id: currentUser.userId } as User,
    updatedBy: { id: currentUser.userId } as User,
  });

  // CompanyBalance güncellemesi:
  if (data.type.trim() === "Ödeme") {
    balance.amount = Number(balance.amount) - data.amount;
  } else if (data.type.trim() === "Tahsilat") {
    balance.amount = Number(balance.amount) + data.amount;
  } else {
    throw new Error("Geçersiz işlem tipi (sadece 'Ödeme' veya 'Tahsilat' olabilir).");
  }

  // Transaction gibi ilerle
  await balanceRepo.save(balance);

  // 4. Kaydet ve return et
  return await projectCurrentRepo.save(newRecord);
};

export const getProjectCurrents = async (projectId: string) => {
  const currents = await projectCurrentRepo.find({
    where: { project: { id: projectId } },
    relations: ["balance", "createdBy", "updatedBy"],
    order: { createdatetime: "DESC" },
  });

  return currents.map((c) => ({
    id: c.id,
    balanceCode: c.balance.code,
    type: c.type,
    amount: c.amount,
    currency: c.currency,
    transactionDate: c.transactionDate,
    description: c.description,
    createdBy: c.createdBy?.name ?? null,
    updatedBy: c.updatedBy?.name ?? null,
    createdatetime: c.createdatetime,
    updatedatetime: c.updatedatetime,
  }));
};