import { AppDataSource } from "../config/data-source";
import { CompanyCheck } from "../entities/CompanyCheck";
import { CompanyBalance } from "../entities/CompanyBalance";
import { EntityManager } from "typeorm";
import { CompanyFinanceTransaction } from "../entities/CompanyFinance";
import { generateFinanceTransactionCode } from "../utils/generateCode";

import { updateCompanyBalanceAfterTransaction } from "../services/companyFinance.service";
import { User } from "../entities/User";
import { CompanyProject } from "../entities/CompanyProject";

export const createCompanyCheck = async (
  data: {
    checkNo: string;
    checkDate: Date;
    transactionDate: Date;
    firm: string;
    amount: number;
    bankCode: string;
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
    code: data.bankCode,
  });

  // 🔄 Duruma göre otomatik transaction oluştur
  let transaction = null;

  /*if (data.status === "PAID" || data.status === "COLLECTED") {
    transaction = await createCheckTransactionFromCheckData(
      {
        checkNo: data.checkNo,
        transactionDate: data.transactionDate,
        amount: data.amount,
        bankId: bank.id,
        firm: data.firm,
        projectId: data.projectId,
        description: data.description,
        type: data.type,
      },
      currentUser,
      manager
    );
  }*/

  // 🧾 Check oluşturuluyor
  const check = repo.create({
    code: data.checkNo,
    checkNo: data.checkNo,
    checkDate: data.checkDate,
    transactionDate: data.dueDate, //data.transactionDate,
    firm: data.firm,
    amount: data.amount,
    bank: { id: bank.id },
    type: data.type,
    //transaction: transaction ? { id: transaction.id } : null,
    project: data.projectId ? { id: data.projectId } : null,
    description: data.description,
    status: "PENDING", //data.status,
    dueDate: data.dueDate,
    remainingAmount: data.amount,
    company: { id: currentUser.companyId },
    createdBy: { id: currentUser.userId },
    updatedBy: { id: currentUser.userId },
  });

  const savedCheck = await repo.save(check);

  return await repo.findOneOrFail({
    where: { id: savedCheck.id },
    relations: {
      project: true,
      bank: true,
      createdBy: true,
      updatedBy: true,
    },
  });
};

export const updateCompanyCheck = async (
  code: string,
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
  const transactionRepo = manager.getRepository(CompanyFinanceTransaction);
  const projectRepo = manager.getRepository(CompanyProject);

  // 🎯 Mevcut check kaydını getir
  const existing = await repo.findOne({
    where: { code, company: { id: currentUser.companyId } },
    relations: ["bank", "transaction", "project"],
  });

  if (!existing) throw new Error("Check kaydı bulunamadı.");

  // 🧠 Önceki değerleri sakla
  const prevStatus = existing.status;
  const prevAmount = existing.amount;
  const prevBankId = existing.bank?.id;
  const prevTransaction = existing.transaction;

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

  // 🔍 Durum değişti mi? (örneğin PAID → COLLECTED gibi)
  const isStatusChanged =
    (prevStatus === "PAID" && newStatus === "COLLECTED") ||
    (prevStatus === "COLLECTED" && newStatus === "PAID");

  // 🧾 Yeni transaction oluşturulmalı mı?
  const shouldRecreateTransaction =
    isStatusChanged || // status değiştiyse
    (!prevTransaction && (newStatus === "PAID" || newStatus === "COLLECTED")) || // ilk defa ekleniyor
    (prevTransaction && (newStatus === "PAID" || newStatus === "COLLECTED")); // güncelleniyor

  // 🧹 Önceki transaction varsa geri al ve FK kaldır
  if (shouldRecreateTransaction && prevTransaction) {
    // 💸 Balance geri al
    await updateCompanyBalanceAfterTransaction(
      prevTransaction.type,
      prevBankId,
      null,
      prevAmount,
      manager,
      true // rollback
    );

    // ❗ FK kaldır
    existing.transaction = null;
    await repo.save(existing); // önce FK null yapılmalı

    // 🔥 Transaction sil
    await transactionRepo.delete(prevTransaction.id);
  }

  // ➕ Yeni transaction oluştur
  if (shouldRecreateTransaction) {
    const newTransaction = await createCheckTransactionFromCheckData(
      {
        checkNo: data.checkNo ?? existing.checkNo,
        transactionDate: data.transactionDate ?? existing.transactionDate,
        amount: data.amount ?? existing.amount,
        bankId: newBank.id,
        firm: data.firm ?? existing.firm,
        projectId: data.projectId ?? existing.project?.id,
        description: data.description ?? existing.description,
        type: data.type ?? existing.type,
      },
      currentUser,
      manager
    );

    existing.transaction = {
      id: newTransaction.id,
    } as CompanyFinanceTransaction;
  }

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
  return await repo.save(existing);
};

export const createCheckTransactionFromCheckData = async (
  check: {
    checkNo: string;
    transactionDate: Date;
    amount: number;
    bankId: string;
    firm: string;
    projectId?: string;
    description?: string;
    type: "PAYMENT" | "COLLECTION";
  },
  currentUser: {
    userId: string;
    companyId: string;
  },
  manager: EntityManager = AppDataSource.manager
): Promise<CompanyFinanceTransaction> => {
  const repo = manager.getRepository(CompanyFinanceTransaction);

  const code = await generateFinanceTransactionCode(
    check.type,
    check.transactionDate,
    manager
  );

  const transaction = repo.create({
    type: check.type,
    code,
    amount: check.amount,
    currency: "TRY", // 🔧 şimdilik sabit, ileride parametre olabilir
    fromAccount: { id: check.bankId },
    //targetType: "OTHER",
    targetName: check.firm,
    transactionDate: check.transactionDate,
    method: check.type === "COLLECTION" ? "CHECK" : "BANK",
    category: "CEK", //check.type === "COLLECTION" ? "Çek Tahsilatı" : "Çek Ödeme",
    invoiceYN: "N",
    referenceCode: check.checkNo,
    description: check.description,
    company: { id: currentUser.companyId },
    project: check.projectId ? { id: check.projectId } : null,
    createdBy: { id: currentUser.userId },
    updatedBy: { id: currentUser.userId },
  });

  const savedTransactionRecord = await repo.save(transaction);

  await updateCompanyBalanceAfterTransaction(
    check.type,
    check.bankId,
    null,
    check.amount,
    manager
  );

  return savedTransactionRecord;
};

export const getCompanyChecks = async (
  currentUser: { userId: string; companyId: string },
  manager: EntityManager = AppDataSource.manager
) => {
  const repo = manager.getRepository(CompanyCheck);

  const transactions = await repo.find({
    where: {
      company: { id: currentUser.companyId },
    },
    relations: ["bank", "project", "transaction", "createdBy", "updatedBy"],
    order: { transactionDate: "DESC" },
  });

  return transactions;
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
    relations: ["bank", "project", "transaction", "createdBy", "updatedBy"],
  });

  if (!check) {
    throw new Error("İlgili çek bulunamadı.");
  }

  return check;
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
