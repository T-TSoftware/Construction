import { EntityManager } from "typeorm";
import { CompanyFinanceTransaction } from "../entities/CompanyFinance";
import { CompanyBalance } from "../entities/CompanyBalance";
import { CompanyProject } from "../entities/CompanyProject";

import { AppDataSource } from "../config/data-source";

// Eğer ayrı bir dosyada tutuyorsan import edebilirsin
import { generateFinanceTransactionCode } from "../utils/generateCode";
import { CompanyOrder } from "../entities/CompanyOrder";
import { updateOrderPaymentStatus } from "./companyOrder.service";

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
    projectCode?: string;
    source?: string;
    orderCode?: string;
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
  const orderRepo = manager.getRepository(CompanyOrder);

  const fromAccount = await balanceRepo.findOneByOrFail({
    code: data.fromAccountCode,
  });

  const order = data.orderCode
    ? await orderRepo.findOneByOrFail({ code: data.orderCode })
    : null;

  const project = data.projectCode
    ? await projectRepo.findOneByOrFail({ code: data.projectCode })
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
      //checkCode: data.checkCode,
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

    await updateCompanyBalanceAfterTransaction(
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
    //checkCode: data.checkCode,
    description: data.description,
    company: { id: currentUser.companyId },
    project: project ? { id: project.id } : null,
    source: data.source,
    order: order ? { id: order.id } : null,
    createdBy: { id: currentUser.userId },
    updatedBy: { id: currentUser.userId },
  });

  const saved = await transactionRepo.save(transaction);

  if (data.orderCode) {
    await updateOrderPaymentStatus(
      data.orderCode,
      data.amount,
      currentUser,
      manager
    );
  }

  await updateCompanyBalanceAfterTransaction(
    data.type,
    fromAccount.id,
    null,
    data.amount,
    manager
  );
  return saved;
};

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
    referenceCode?: string;
    description?: string;
    orderCode?: string;
    projectCode?: string;
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
  const orderRepo = manager.getRepository(CompanyOrder);

  const existing = await transactionRepo.findOne({
    where: { code, company: { id: currentUser.companyId } },
    relations: ["fromAccount", "toAccount", "company", "project", "order"],
  });

  if (!existing) {
    throw new Error("Finansal işlem bulunamadı.");
  }

  // 🔁 Eski işlemi geri al
  await updateCompanyBalanceAfterTransaction(
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

  const newOrder =
    data.orderCode && data.orderCode !== existing.order?.code
      ? await orderRepo.findOneByOrFail({ code: data.orderCode })
      : existing.order;

  const newProject =
    data.projectCode && data.projectCode !== existing.project?.id
      ? await projectRepo.findOneByOrFail({ code: data.projectCode })
      : existing.project;

  // 💾 Güncellemeden önce eski amount'u sakla
  const previousAmount = existing.amount;
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
  existing.referenceCode = data.referenceCode ?? existing.referenceCode;
  existing.description = data.description ?? existing.description;
  //existing.order = newOrder;
  existing.project = newProject;
  existing.updatedBy = { id: currentUser.userId } as any;
  existing.updatedatetime = new Date();
  console.log("existing amount 1: ", existing.amount);
  // 💾 Güncelle
  const updated = await transactionRepo.save(existing);

  console.log(
    "ordercode :",
    existing.order?.code,
    " data.amount: ",
    data.amount,
    " existing amount: ",
    existing.amount
  );
  if (
    existing.order?.code &&
    data.amount !== undefined &&
    Number(data.amount) !== Number(previousAmount)
  ) {
    const diff = Number(data.amount) - Number(previousAmount);

    await updateOrderPaymentStatus(
      existing.order.code,
      diff,
      currentUser,
      manager
    );
  }

  // 🔁 Yeni işlemin etkisini uygula
  await updateCompanyBalanceAfterTransaction(
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
export const updateCompanyBalanceAfterTransaction = async (
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

  console.log("enter updateee", fromAccountId, " ", type);

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
    relations: ["fromAccount", "toAccount", "project", "updatedBy", "order"],
    order: { transactionDate: "DESC" },
  });

  return transactions;
};

export const getCompanyFinanceTransactionById = async (
  id: string,
  currentUser: { userId: string; companyId: string },
  manager: EntityManager = AppDataSource.manager
) => {
  const repo = manager.getRepository(CompanyFinanceTransaction);

  const transaction = await repo.findOne({
    where: {
      id,
      company: { id: currentUser.companyId },
    },
    relations: ["fromAccount", "toAccount", "project", "updatedBy", "order"],
  });

  if (!transaction) {
    throw new Error("İlgili finansal işlem bulunamadı.");
  }

  return transaction;
};

export const createLoanTransactionFromPaymentData = async (
  payment: {
    paymentCode: string;
    amount: number;
    transactionDate: Date;
    bankId: string;
    loanName: string;
    installmentNumber: number;
    projectId?: string;
    description?: string;
  },
  currentUser: { userId: string; companyId: string },
  manager: EntityManager = AppDataSource.manager
): Promise<CompanyFinanceTransaction> => {
  const repo = manager.getRepository(CompanyFinanceTransaction);

  const code = await generateFinanceTransactionCode(
    "PAYMENT",
    payment.transactionDate,
    manager
  );

  const transaction = repo.create({
    type: "PAYMENT",
    code,
    amount: payment.amount,
    currency: "TRY", // varsayılan
    fromAccount: { id: payment.bankId },
    targetName: payment.loanName,
    transactionDate: payment.transactionDate,
    method: "BANK",
    category: "KREDI",
    source: `${payment.paymentCode} Ödemesi`,
    invoiceYN: "Y",
    referenceCode: payment.paymentCode,
    description: payment.description,
    company: { id: currentUser.companyId },
    project: payment.projectId ? { id: payment.projectId } : null,
    createdBy: { id: currentUser.userId },
    updatedBy: { id: currentUser.userId },
  });

  const saved = await repo.save(transaction);

  await updateCompanyBalanceAfterTransaction(
    "PAYMENT",
    payment.bankId,
    null,
    payment.amount,
    manager
  );

  return saved;
};

export const createBarterTransactionFromCashDetailData = async (
  cashDetail: {
    barterItemCode: string;
    barterName: string;
    amount: number;
    currency: string;
    transactionDate: Date;
    fromAccountId: string;
    direction: "IN" | "OUT";
    projectId?: string;
    description?: string;
  },
  currentUser: { userId: string; companyId: string },
  manager: EntityManager = AppDataSource.manager
): Promise<CompanyFinanceTransaction> => {
  const repo = manager.getRepository(CompanyFinanceTransaction);

  const type = cashDetail.direction === "OUT" ? "PAYMENT" : "COLLECTION";
  const code = await generateFinanceTransactionCode(
    type,
    cashDetail.transactionDate,
    manager
  );

  const transaction = repo.create({
    type,
    code,
    amount: cashDetail.amount,
    currency: cashDetail.currency,
    fromAccount: { id: cashDetail.fromAccountId },
    targetName: cashDetail.barterName,
    transactionDate: cashDetail.transactionDate,
    method: "BANK",
    category: "BARTER",
    source: `${cashDetail.barterItemCode} Takas`,
    //barterCode: cashDetail.barterItemCode,
    description: cashDetail.description,
    company: { id: currentUser.companyId },
    project: cashDetail.projectId ? { id: cashDetail.projectId } : null,
    createdBy: { id: currentUser.userId },
    updatedBy: { id: currentUser.userId },
  });

  const saved = await repo.save(transaction);

  await updateCompanyBalanceAfterTransaction(
    type,
    cashDetail.fromAccountId,
    null,
    cashDetail.amount,
    manager
  );

  return saved;
};

export const deleteCompanyFinanceTransactionById = async (
  id: string,
  currentUser: { userId: string; companyId: string },
  manager: EntityManager
) => {
  const transactionRepo = manager.getRepository(CompanyFinanceTransaction);

  const transaction = await transactionRepo.findOneOrFail({
    where: { id },
    relations: ["company", "fromAccount", "toAccount"],
  });

  if (transaction.company.id !== currentUser.companyId) {
    throw new Error("Bu finansal işlem kaydına erişim yetkiniz yok.");
  }

  console.log("from account from: ", transaction.fromAccount);

  await updateCompanyBalanceAfterTransaction(
    transaction.type,
    transaction.fromAccount.id,
    transaction.toAccount?.id ?? null,
    transaction.amount,
    manager,
    true
  );

  await transactionRepo.delete({ id: transaction.id });
};
