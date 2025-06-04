import { AppDataSource } from "../config/data-source";
import { CompanyCheck } from "../entities/CompanyCheck";
import { CompanyBalance } from "../entities/CompanyBalance";
import { EntityManager } from "typeorm";
import { CompanyFinanceTransaction } from "../entities/CompanyFinance";
import { generateFinanceTransactionCode } from "../utils/generateCode";

import { updateCompanyBalance } from "../services/companyFinance.service";

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

  if (data.status === "PAID" || data.status === "COLLECTED") {
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
  }

  // 🧾 Check oluşturuluyor
  const check = repo.create({
    code: data.checkNo,
    checkNo: data.checkNo,
    checkDate: data.checkDate,
    transactionDate: data.transactionDate,
    firm: data.firm,
    amount: data.amount,
    bank: { id: bank.id },
    type: data.type,
    transaction: transaction ? { id: transaction.id } : null,
    project: data.projectId ? { id: data.projectId } : null,
    description: data.description,
    status: data.status,
    company: { id: currentUser.companyId },
    createdBy: { id: currentUser.userId },
    updatedBy: { id: currentUser.userId },
  });

  return await repo.save(check);
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
    category: check.type === "COLLECTION" ? "Çek Tahsilate" : "Çek Ödeme",
    invoiceYN: "N",
    checkCode: check.checkNo,
    description: check.description,
    company: { id: currentUser.companyId },
    project: check.projectId ? { id: check.projectId } : null,
    createdBy: { id: currentUser.userId },
    updatedBy: { id: currentUser.userId },
  });

  const savedTransactionRecord = await repo.save(transaction);

  await updateCompanyBalance(
    check.type,
    check.bankId,
    null,
    check.amount,
    manager
  );

  return savedTransactionRecord;
};
