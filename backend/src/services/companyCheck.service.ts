import { AppDataSource } from "../config/data-source";
import { CompanyCheck } from "../entities/CompanyCheck";
import { CompanyBalance } from "../entities/CompanyBalance";
import { EntityManager, Timestamp } from "typeorm";
import { updateCompanyBalanceAfterTransaction } from "../services/companyFinance.service";
import { User } from "../entities/User";
import { CompanyProject } from "../entities/CompanyProject";
import { sanitizeRules } from "../utils/sanitizeRules";
import { saveRefetchSanitize } from "../utils/persist";
import { sanitizeEntity } from "../utils/sanitize";

export const createCompanyCheck = async (
  data: {
    checkNo: string;
    checkDate: Date;
    //transactionDate: Date;
    firm: string;
    amount: number;
    bankId: string;
    type: "PAYMENT" | "COLLECTION";
    projectId?: string;
    description?: string;
    status?: string; // "PAID" | "COLLECTED" vs.
    dueDate: Date;
  },
  currentUser: {
    userId: string;
    companyId: string;
  },
  manager: EntityManager = AppDataSource.manager
) => {
  const repo = manager.getRepository(CompanyCheck);
  const balanceRepo = manager.getRepository(CompanyBalance);

  const bank = await balanceRepo.findOneByOrFail({
    id: data.bankId,
  });

  // 🔄 Duruma göre otomatik transaction oluştur
  let transaction = null;

  // 🧾 Check oluşturuluyor
  const check = repo.create({
    code: `CEK-${data.checkNo}`,
    checkNo: data.checkNo,
    checkDate: data.checkDate,
    //transactionDate: data.dueDate, //data.transactionDate,
    firm: data.firm,
    amount: data.amount,
    bank: { id: bank.id },
    type: data.type,
    project: data.projectId ? { id: data.projectId } : null,
    description: data.description,
    status: "PENDING", //data.status,
    dueDate: data.dueDate,
    remainingAmount: data.amount,
    company: { id: currentUser.companyId },
    createdBy: { id: currentUser.userId },
    updatedBy: { id: currentUser.userId },
  });

  /*const savedCheck = await repo.save(check);

  return await repo.findOneOrFail({
    where: { id: savedCheck.id },
    relations: {
      project: true,
      bank: true,
      createdBy: true,
      updatedBy: true,
    },
  });*/
  return await saveRefetchSanitize({
    entityName: "CompanyCheck",
    save: () => repo.save(check),
    refetch: () =>
      repo.findOneOrFail({
        where: { id: check.id, company: { id: currentUser.companyId } },
        relations: ["project", "company", "bank", "createdBy", "updatedBy"],
      }),
    rules: sanitizeRules,
    defaultError: "Çek kaydı oluşturulamadı.",
  });
};

export const updateCompanyCheck = async (
  id: string,
  data: {
    checkNo?: string;
    checkDate?: Date;
    transactionDate?: Date;
    firm?: string;
    amount?: number;
    bankCode?: string;
    type?: "PAYMENT" | "COLLECTION";
    projectId?: string;
    description?: string;
    status?: string; // "PAID", "COLLECTED", vs.
  },
  currentUser: {
    userId: string;
    companyId: string;
  },
  manager: EntityManager = AppDataSource.manager
) => {
  const repo = manager.getRepository(CompanyCheck);
  const balanceRepo = manager.getRepository(CompanyBalance);
  const projectRepo = manager.getRepository(CompanyProject);

  // 🎯 Mevcut check kaydını getir
  const existing = await repo.findOne({
    where: { id, company: { id: currentUser.companyId } },
    relations: ["bank", "project", "createdBy", "updatedBy"],
  });

  if (!existing) throw new Error("Check kaydı bulunamadı.");

  // 🔄 Yeni banka atanacak mı?
  const newBank =
    data.bankCode && data.bankCode !== existing.bank?.code
      ? await balanceRepo.findOneByOrFail({ code: data.bankCode })
      : existing.bank;

  // 🔄 Yeni proje atanacak mı?
  const newProject =
    data.projectId && data.projectId !== existing.project?.id
      ? await projectRepo.findOneByOrFail({ id: data.projectId })
      : existing.project;

  const newStatus = data.status ?? existing.status;

  // ✏️ Diğer alanlar güncelleniyor
  existing.checkNo = data.checkNo ?? existing.checkNo;
  existing.code = data.checkNo ?? existing.checkNo;
  existing.checkDate = data.checkDate ?? existing.checkDate;
  existing.transactionDate = data.transactionDate ?? existing.transactionDate;
  existing.firm = data.firm ?? existing.firm;
  existing.amount = data.amount ?? existing.amount;
  existing.bank = newBank;
  existing.type = data.type ?? existing.type;
  existing.project = newProject;
  existing.description = data.description ?? existing.description;
  existing.status = newStatus;
  existing.updatedBy = { id: currentUser.userId } as any;
  existing.updatedatetime = new Date();

  // 💾 Kaydet ve dön
  //return await repo.save(existing);
  return await saveRefetchSanitize({
    entityName: "CompanyCheck",
    save: () => repo.save(existing),
    refetch: () =>
      repo.findOneOrFail({
        where: { id: existing.id, company: { id: currentUser.companyId } },
        relations: ["project", "company", "bank", "createdBy", "updatedBy"],
      }),
    rules: sanitizeRules,
    defaultError: "Çek kaydı oluşturulamadı.",
  });
};

export const getCompanyChecks = async (
  currentUser: { userId: string; companyId: string },
  manager: EntityManager = AppDataSource.manager
) => {
  const repo = manager.getRepository(CompanyCheck);

  const checks = await repo.find({
    where: {
      company: { id: currentUser.companyId },
    },
    relations: ["bank", "project", "createdBy", "updatedBy"],
    order: { transactionDate: "DESC" },
  });

  //return checks;
  return sanitizeEntity(checks, "CompanyCheck", sanitizeRules);
};

export const getCompanyCheckById = async (
  id: string,
  currentUser: { userId: string; companyId: string },
  manager: EntityManager = AppDataSource.manager
) => {
  const repo = manager.getRepository(CompanyCheck);

  const check = await repo.findOne({
    where: {
      id,
      company: { id: currentUser.companyId },
    },
    relations: ["bank", "project", "createdBy", "updatedBy"],
  });

  if (!check) {
    throw new Error("İlgili çek bulunamadı.");
  }

  //return check;
  return sanitizeEntity(check, "CompanyCheck", sanitizeRules);
};

export const updateCheckPaymentStatus = async (
  checkCode: string,
  amountPaid: number,
  currentUser: { userId: string },
  manager: EntityManager
) => {
  const checkRepo = manager.getRepository(CompanyCheck);

  const check = await checkRepo.findOneByOrFail({ code: checkCode });

  const remainingAmount = Number(check.remainingAmount) - Number(amountPaid);

  let status: string;
  if (remainingAmount <= 0) {
    status = check.type === "PAYMENT" ? "PAID" : "COLLECTED";
  } else {
    status = check.type === "PAYMENT" ? "PARTIAL" : "PARTIAL";
  }

  check.status = status;
  check.remainingAmount = remainingAmount;
  check.updatedBy = { id: currentUser.userId } as User;

  return await checkRepo.save(check);
};

export const updateCheckPaymentStatusNew = async (
  checkCode: string,
  amount: number,
  transactionDate: Date,
  currentUser: { userId: string },
  manager: EntityManager,
  isReverse = false
) => {
  const checkRepo = manager.getRepository(CompanyCheck);

  const check = await checkRepo.findOneOrFail({
    where: { code: checkCode },
  });

  const factor = isReverse ? -1 : 1;

  // ✅ processedAmount güncelle (increment/decrement)
  await checkRepo.increment(
    { id: check.id },
    "processedAmount",
    factor * amount
  );

  // Güncellenmiş veriyi tekrar al
  const updatedItem = await checkRepo.findOneOrFail({
    where: { id: check.id },
  });

  // ✅ remainingAmount hesapla
  const remainingAmount =
    Number(updatedItem.amount ?? 0) - Number(updatedItem.processedAmount);

  // ✅ status belirle
  let status: "PAID" | "COLLECTED" | "PARTIAL";
  if (remainingAmount <= 0) {
    status = updatedItem.type === "PAYMENT" ? "PAID" : "COLLECTED";
  } else {
    status = "PARTIAL";
  }

  updatedItem.remainingAmount = remainingAmount;
  updatedItem.status = status;
  updatedItem.updatedBy = { id: currentUser.userId } as User;
  updatedItem.updatedatetime = new Date();
  updatedItem.transactionDate = transactionDate;

  return await checkRepo.save(updatedItem);
};
