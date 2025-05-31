import { EntityManager } from "typeorm";
import { CompanyFinanceTransaction } from "../entities/CompanyFinance";
import { CompanyBalance } from "../entities/CompanyBalance";
import { CompanyProject } from "../entities/CompanyProject";

import { AppDataSource } from "../config/data-source";

// Eğer ayrı bir dosyada tutuyorsan import edebilirsin
import { generateFinanceTransactionCode } from "../utils/generateCode";

const transactionRepo = AppDataSource.getRepository(CompanyFinanceTransaction);
const balanceRepo = AppDataSource.getRepository(CompanyBalance);
const projectRepo = AppDataSource.getRepository(CompanyProject);

export const createCompanyFinanceTransaction = async (
  data: {
    type: "PAYMENT" | "COLLECTION" | "TRANSFER";
    amount: number;
    currency: string;
    fromAccountCode: string;
    toAccountCode?: string; // ✅ TRANSFER için hedef şirket içi hesap
    targetType?: string;
    targetId?: string;
    targetName?: string;
    transactionDate: Date;
    method: string;
    category: string;
    invoiceYN?: "Y" | "N";
    invoiceCode?: string;
    checkCode?: string;
    description?: string;
    projectId?: string;
    source?: string;
  },
  currentUser: {
    userId: string;
    companyId: string;
  },
  manager: EntityManager = AppDataSource.manager
) => {
  const transactionRepo = manager.getRepository(CompanyFinanceTransaction);
  const balanceRepo = manager.getRepository(CompanyBalance);
  const projectRepo = manager.getRepository(CompanyProject);

  const fromAccount = await balanceRepo.findOneByOrFail({
    code: data.fromAccountCode,
  });

  const project = data.projectId
    ? await projectRepo.findOneByOrFail({ id: data.projectId })
    : null;

  const results: CompanyFinanceTransaction[] = [];

  // TRANSFER işlemiyse çift kayıt oluştur
  if (data.type === "TRANSFER") {
    if (!data.toAccountCode) {
      throw new Error("Transfer için toAccountCode zorunludur.");
    }

    const toAccount = await balanceRepo.findOneByOrFail({
      code: data.toAccountCode,
    });

    // OUT → fromAccount
    const outCode = await generateFinanceTransactionCode(
      "TRANSFER",
      data.transactionDate,
      manager,
      "OUT"
    );
    const outTransaction = transactionRepo.create({
      type: "TRANSFER",
      code: outCode,
      amount: data.amount,
      currency: data.currency,
      fromAccount: { id: fromAccount.id },
      toAccount: { id: toAccount.id },
      targetType: "BANK",
      targetId: toAccount.id,
      targetName: toAccount.name,
      transactionDate: data.transactionDate,
      method: data.method,
      category: data.category,
      invoiceYN: data.invoiceYN ?? "N",
      invoiceCode: data.invoiceCode,
      checkCode: data.checkCode,
      description: `Transfer to ${toAccount.name}`,
      company: { id: currentUser.companyId },
      project: project ? { id: project.id } : null,
      source: data.source,
      createdBy: { id: currentUser.userId },
      updatedBy: { id: currentUser.userId },
    });

    const inCode = await generateFinanceTransactionCode(
      "TRANSFER",
      data.transactionDate,
      manager,
      "IN"
    );
    const inTransaction = transactionRepo.create({
      type: "TRANSFER",
      code: inCode,
      amount: data.amount,
      currency: data.currency,
      fromAccount: { id: toAccount.id },
      targetType: "BANK",
      targetId: fromAccount.id,
      targetName: fromAccount.name,
      transactionDate: data.transactionDate,
      method: data.method,
      category: data.category,
      invoiceYN: "N",
      description: `Transfer from ${fromAccount.name}`,
      company: { id: currentUser.companyId },
      project: project ? { id: project.id } : null,
      source: data.source,
      createdBy: { id: currentUser.userId },
      updatedBy: { id: currentUser.userId },
    });

    results.push(
      await transactionRepo.save(outTransaction),
      await transactionRepo.save(inTransaction)
    );

    await updateCompanyBalance(
      "TRANSFER",
      fromAccount.id,
      toAccount.id,
      data.amount
    );
    return results;
  }

  // PAYMENT / COLLECTION işlemi için tek kayıt
  const code = await generateFinanceTransactionCode(
    data.type,
    data.transactionDate,
    manager
  );
  const transaction = transactionRepo.create({
    type: data.type,
    code,
    amount: data.amount,
    currency: data.currency,
    fromAccount: { id: fromAccount.id },
    targetType: data.targetType,
    targetId: data.targetId,
    targetName: data.targetName,
    transactionDate: data.transactionDate,
    method: data.method,
    category: data.category,
    invoiceYN: data.invoiceYN ?? "N",
    invoiceCode: data.invoiceCode,
    checkCode: data.checkCode,
    description: data.description,
    company: { id: currentUser.companyId },
    project: project ? { id: project.id } : null,
    source: data.source,
    createdBy: { id: currentUser.userId },
    updatedBy: { id: currentUser.userId },
  });
  const saved = await transactionRepo.save(transaction);
  await updateCompanyBalance(data.type, fromAccount.id, null, data.amount);
  return saved;
};

const updateCompanyBalance = async (
  type: "PAYMENT" | "COLLECTION" | "TRANSFER",
  fromAccountId: string | null,
  toAccountId: string | null,
  amount: number
) => {
  if (type === "PAYMENT" && fromAccountId) {
    await balanceRepo.increment({ id: fromAccountId }, "amount", -amount);
  }

  if (type === "COLLECTION" && fromAccountId) {
    await balanceRepo.increment({ id: fromAccountId }, "amount", amount);
  }

  if (type === "TRANSFER") {
    if (fromAccountId) {
      await balanceRepo.increment({ id: fromAccountId }, "amount", -amount);
    }
    if (toAccountId) {
      await balanceRepo.increment({ id: toAccountId }, "amount", amount);
    }
  }
};
