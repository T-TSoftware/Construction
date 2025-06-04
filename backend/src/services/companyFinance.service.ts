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
      data.amount,
      manager
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
  await updateCompanyBalance(
    data.type,
    fromAccount.id,
    null,
    data.amount,
    manager
  );
  return saved;
};

/*export const updateCompanyFinanceTransaction = async (
  id: string,
  data: {
    type?: "PAYMENT" | "COLLECTION" | "TRANSFER";
    amount?: number;
    currency?: string;
    fromAccountCode?: string;
    toAccountCode?: string;
    targetType?: string;
    targetId?: string;
    targetName?: string;
    transactionDate?: Date;
    method?: string;
    category?: string;
    invoiceYN?: "Y" | "N";
    invoiceCode?: string;
    checkCode?: string;
    description?: string;
    projectId?: string | null;
    source?: string;
  },
  currentUser: {
    userId: string;
    companyId: string;
  },
  manager: EntityManager = AppDataSource.manager
): Promise<CompanyFinanceTransaction> => {
  const repo = manager.getRepository(CompanyFinanceTransaction);
  const balanceRepo = manager.getRepository(CompanyBalance);
  const projectRepo = manager.getRepository(CompanyProject);

  const transaction = await repo.findOne({
    where: {
      id,
      company: { id: currentUser.companyId },
    },
    relations: ["fromAccount", "toAccount", "project"],
  });

  if (!transaction) throw new Error("Finansal işlem bulunamadı.");

  // 🔁 Balance geri alma
  await updateCompanyBalance(
    transaction.type,
    transaction.fromAccount?.id ?? null,
    transaction.toAccount?.id ?? null,
    transaction.amount,
    manager,
    true // geri alma işlemi
  );

  // 🔄 Güncellenecek alanlar
  if (data.type) transaction.type = data.type;
  if (data.amount !== undefined) transaction.amount = data.amount;
  if (data.currency) transaction.currency = data.currency;
  if (data.fromAccountCode) {
    const fromAccount = await balanceRepo.findOneByOrFail({
      code: data.fromAccountCode,
    });
    transaction.fromAccount = fromAccount;
  }
  if (data.toAccountCode) {
    const toAccount = await balanceRepo.findOneByOrFail({
      code: data.toAccountCode,
    });
    transaction.toAccount = toAccount;
  }
  if (data.targetType !== undefined) transaction.targetType = data.targetType;
  if (data.targetId !== undefined) transaction.targetId = data.targetId;
  if (data.targetName !== undefined) transaction.targetName = data.targetName;
  if (data.transactionDate !== undefined)
    transaction.transactionDate = data.transactionDate;
  if (data.method !== undefined) transaction.method = data.method;
  if (data.category !== undefined) transaction.category = data.category;
  if (data.invoiceYN !== undefined) transaction.invoiceYN = data.invoiceYN;
  if (data.invoiceCode !== undefined)
    transaction.invoiceCode = data.invoiceCode;
  if (data.checkCode !== undefined) transaction.checkCode = data.checkCode;
  if (data.description !== undefined)
    transaction.description = data.description;
  if (data.source !== undefined) transaction.source = data.source;

  if (data.projectId !== undefined) {
    transaction.project = data.projectId
      ? await projectRepo.findOneByOrFail({ id: data.projectId })
      : null;
  }

  transaction.updatedBy = { id: currentUser.userId } as any;
  transaction.updatedatetime = new Date();

  const saved = await repo.save(transaction);

  // ✅ Yeni balance update
  await updateCompanyBalance(
    transaction.type,
    transaction.fromAccount?.id ?? null,
    transaction.toAccount?.id ?? null,
    transaction.amount,
    manager
  );

  return saved;
};*/

export const updateCompanyFinanceTransaction = async (
  code: string,
  data: {
    type?: "PAYMENT" | "COLLECTION" | "TRANSFER";
    amount?: number;
    currency?: string;
    fromAccountCode?: string;
    toAccountCode?: string;
    targetType?: string;
    targetId?: string;
    targetName?: string;
    transactionDate?: Date;
    method?: string;
    category?: string;
    invoiceYN?: "Y" | "N";
    invoiceCode?: string;
    checkCode?: string;
    description?: string;
    projectId?: string;
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

  const existing = await transactionRepo.findOne({
    where: { code, company: { id: currentUser.companyId } },
    relations: ["fromAccount", "toAccount", "company", "project"],
  });
  console.log(existing);
  if (!existing) {
    throw new Error("Finansal işlem bulunamadı.");
  }

  // 🔁 Eski işlemi geri al
  await updateCompanyBalance(
    existing.type,
    existing.fromAccount?.id ?? null,
    existing.toAccount?.id ?? null,
    existing.amount,
    manager,
    true
  );

  // 🧾 Gerekli ilişkileri getir
  const newFromAccount =
    data.fromAccountCode && data.fromAccountCode !== existing.fromAccount?.code
      ? await balanceRepo.findOneByOrFail({ code: data.fromAccountCode })
      : existing.fromAccount;

  const newToAccount =
    data.toAccountCode && data.toAccountCode !== existing.toAccount?.code
      ? await balanceRepo.findOneByOrFail({ code: data.toAccountCode })
      : existing.toAccount;

  const newProject =
    data.projectId && data.projectId !== existing.project?.id
      ? await projectRepo.findOneByOrFail({ id: data.projectId })
      : existing.project;

  // 🛠️ Alanları güncelle
  existing.type = data.type ?? existing.type;
  existing.amount = data.amount ?? existing.amount;
  existing.currency = data.currency ?? existing.currency;
  existing.fromAccount = newFromAccount;
  console.log(newFromAccount);
  existing.toAccount = newToAccount;
  existing.targetType = data.targetType ?? existing.targetType;
  existing.targetId = data.targetId ?? existing.targetId;
  existing.targetName = data.targetName ?? existing.targetName;
  existing.transactionDate = data.transactionDate ?? existing.transactionDate;
  existing.method = data.method ?? existing.method;
  existing.category = data.category ?? existing.category;
  existing.invoiceYN = data.invoiceYN ?? existing.invoiceYN;
  existing.invoiceCode = data.invoiceCode ?? existing.invoiceCode;
  existing.checkCode = data.checkCode ?? existing.checkCode;
  existing.description = data.description ?? existing.description;
  existing.project = newProject;
  existing.updatedBy = { id: currentUser.userId } as any;
  existing.updatedatetime = new Date();

  // 💾 Güncelle
  const updated = await transactionRepo.save(existing);

  // 🔁 Yeni işlemin etkisini uygula
  await updateCompanyBalance(
    updated.type,
    updated.fromAccount?.id ?? null,
    updated.toAccount?.id ?? null,
    updated.amount,
    manager
  );

  return updated;
};

/**
 * Şirket bakiyesini günceller. İşlem türüne göre ilgili hesaplardan para düşer veya eklenir.
 *
 * @param type - İşlem türü: PAYMENT (ödeme), COLLECTION (tahsilat), TRANSFER (hesaplar arası transfer)
 * @param fromAccountId - Paranın çıktığı hesap ID'si
 * @param toAccountId - Paranın girdiği hesap ID'si (sadece TRANSFER için kullanılır)
 * @param amount - İşlem tutarı
 * @param manager - Transaction içinde kullanılacak EntityManager
 * @param isReverse - true ise işlemin etkisini geri alır (örneğin eski işlem geri çekilirken)
 */
export const updateCompanyBalance = async (
  type: "PAYMENT" | "COLLECTION" | "TRANSFER",
  fromAccountId: string | null,
  toAccountId: string | null,
  amount: number,
  manager: EntityManager,
  isReverse: boolean = false // default olarak false, yani normal işlem yapılır
) => {
  const repo = manager.getRepository(CompanyBalance);

  // Ödeme ve transferde: normalde -amount → ters işlemde +amount
  // Tahsilatta: normalde +amount → ters işlemde -amount
  const sign = isReverse ? 1 : -1; // PAYMENT ve TRANSFER işlemlerinde kullanılır
  const reverseSign = isReverse ? -1 : 1; // COLLECTION işlemi için

  // 🔻 Ödeme (PAYMENT): Paranın çıktığı hesabın bakiyesi azalır
  if (type === "PAYMENT" && fromAccountId) {
    await repo.increment({ id: fromAccountId }, "amount", sign * amount);
    console.log(`${isReverse ? "REVERSE" : "APPLY"} PAYMENT: ${sign * amount}`);
  }

  // 🔺 Tahsilat (COLLECTION): Paranın geldiği hesabın bakiyesi artar
  if (type === "COLLECTION" && fromAccountId) {
    await repo.increment({ id: fromAccountId }, "amount", reverseSign * amount);
    console.log(
      `${isReverse ? "REVERSE" : "APPLY"} COLLECTION: ${reverseSign * amount}`
    );
  }

  // 🔁 Transfer (TRANSFER): Bir hesaptan düşülür, diğerine eklenir
  if (type === "TRANSFER") {
    if (fromAccountId) {
      await repo.increment({ id: fromAccountId }, "amount", sign * amount);
      console.log(
        `${isReverse ? "REVERSE" : "APPLY"} TRANSFER FROM: ${sign * amount}`
      );
    }
    if (toAccountId) {
      await repo.increment({ id: toAccountId }, "amount", -sign * amount);
      console.log(
        `${isReverse ? "REVERSE" : "APPLY"} TRANSFER TO: ${-sign * amount}`
      );
    }
  }
};

export const getCompanyFinanceTransactions = async (
  currentUser: { userId: string; companyId: string },
  manager: EntityManager = AppDataSource.manager
) => {
  const repo = manager.getRepository(CompanyFinanceTransaction);

  const transactions = await repo.find({
    where: {
      company: { id: currentUser.companyId },
    },
    //relations: ["fromAccount", "toAccount", "project", "updatedBy"],
    order: { transactionDate: "DESC" },
  });

  return transactions;
};