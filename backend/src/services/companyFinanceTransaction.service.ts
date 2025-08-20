import { EntityManager } from "typeorm";
import { CompanyFinanceTransaction } from "../entities/CompanyFinance";
import { CompanyBalance } from "../entities/CompanyBalance";
import { CompanyProject } from "../entities/CompanyProject";

import { AppDataSource } from "../config/data-source";

// Eğer ayrı bir dosyada tutuyorsan import edebilirsin
import { generateFinanceTransactionCode } from "../utils/generateCode";
import { CompanyOrder } from "../entities/CompanyOrder";
import {
  updateOrderPaymentStatus,
  updateOrderPaymentStatusNew,
} from "./companyOrder.service";
import { updateCompanyBalanceAfterTransaction } from "./companyFinance.service";
import { CompanyCheck } from "../entities/CompanyCheck";
import { User } from "../entities/User";
import { updateCompanyLoanPaymentChange } from "./companyLoan.service";
import { CompanyLoanPayment } from "../entities/CompanyLoanPayment";
import { updateLoanPaymentStatusNew } from "./companyLoanPayment.service";
import {
  updateCheckPaymentStatus,
  updateCheckPaymentStatusNew,
} from "./companyCheck.service";
import { ProjectSubcontractor } from "../entities/ProjectSubcontractor";
import { ProjectSupplier } from "../entities/ProjectSupplier";
import {
  updateProjectSubcontractorStatus,
  updateProjectSubcontractorStatusNew,
} from "./projectSubcontractor.service";
import {
  updateProjectSupplierStatus,
  updateProjectSupplierStatusNew,
} from "./projectSupplier.service";
import {
  updateBarterItemPaymentStatus,
  updateBarterItemPaymentStatusNew,
} from "./companyBarterAgreementItem.service";
import { CompanyBarterAgreementItem } from "../entities/CompanyBarterAgreementItem";
import { saveRefetchSanitize } from "../utils/persist";
import { sanitizeRules } from "../utils/sanitizeRules";
import { sanitizeEntity } from "../utils/sanitize";

const transactionRepo = AppDataSource.getRepository(CompanyFinanceTransaction);
const balanceRepo = AppDataSource.getRepository(CompanyBalance);
const projectRepo = AppDataSource.getRepository(CompanyProject);

export const createCompanyFinanceTransaction = async (
  data: {
    type: "PAYMENT" | "COLLECTION" | "TRANSFER";
    amount: number;
    currency: string;
    fromAccountCode: string;
    toAccountCode?: string;
    targetType?: string;
    targetId?: string;
    targetName?: string;
    transactionDate: Date;
    method: string;
    category: string;
    invoiceYN?: "Y" | "N";
    invoiceCode?: string;
    referenceCode?: string;
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
  const orderRepo = manager.getRepository(CompanyOrder);
  const checkRepo = manager.getRepository(CompanyCheck);
  const loanPaymentRepo = manager.getRepository(CompanyLoanPayment);
  const subcontractorRepo = manager.getRepository(ProjectSubcontractor);
  const supplierRepo = manager.getRepository(ProjectSupplier);
  const barterItemRepo = manager.getRepository(CompanyBarterAgreementItem);

  const fromAccount = await balanceRepo.findOneByOrFail({
    code: data.fromAccountCode,
  });

  const project = data.projectId
    ? await projectRepo.findOneByOrFail({ id: data.projectId })
    : null;

  const results: CompanyFinanceTransaction[] = [];

  // 🔁 TRANSFER işlemi → çift kayıt (OUT & IN)
  if (data.type === "TRANSFER") {
    if (!data.toAccountCode) {
      throw new Error("Transfer için toAccountCode zorunludur.");
    }

    const toAccount = await balanceRepo.findOneByOrFail({
      code: data.toAccountCode,
    });

    const outCode = await generateFinanceTransactionCode(
      "TRANSFER",
      data.transactionDate,
      manager,
      "OUT"
    );
    const inCode = await generateFinanceTransactionCode(
      "TRANSFER",
      data.transactionDate,
      manager,
      "IN"
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
      referenceCode: data.referenceCode,
      description: `Transfer to ${toAccount.name}`,
      company: { id: currentUser.companyId },
      project: project ? { id: project.id } : null,
      source: data.source,
      createdBy: { id: currentUser.userId },
      updatedBy: { id: currentUser.userId },
    });

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

    /*results.push(
      await transactionRepo.save(outTransaction),
      await transactionRepo.save(inTransaction)
    );*/
    // OUT ve IN kayıtlarını kaydet + refetch + sanitize
    const [outSanitized, inSanitized] = await Promise.all([
      saveRefetchSanitize({
        entityName: "CompanyFinance",
        save: () => transactionRepo.save(outTransaction),
        refetch: () =>
          transactionRepo.findOneOrFail({
            where: {
              id: outTransaction.id,
              company: { id: currentUser.companyId },
            },
            relations: [
              "company",
              "project",
              "fromAccount",
              "toAccount",
              "createdBy",
              "updatedBy",
            ],
          }),
        rules: sanitizeRules,
        defaultError: "İşlem kaydı oluşturulamadı.",
      }),
      saveRefetchSanitize({
        entityName: "CompanyFinance",
        save: () => transactionRepo.save(inTransaction),
        refetch: () =>
          transactionRepo.findOneOrFail({
            where: {
              id: inTransaction.id,
              company: { id: currentUser.companyId },
            },
            relations: [
              "company",
              "project",
              "fromAccount",
              "toAccount",
              "createdBy",
              "updatedBy",
            ],
          }),
        rules: sanitizeRules,
        defaultError: "İşlem kaydı oluşturulamadı.",
      }),
    ]);

    await updateCompanyBalanceAfterTransaction(
      "TRANSFER",
      fromAccount.id,
      toAccount.id,
      data.amount,
      manager
    );

    return [outSanitized, inSanitized];
  }

  // 💳 PAYMENT / COLLECTION işlemi
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
    referenceCode: data.referenceCode,
    description: data.description,
    company: { id: currentUser.companyId },
    project: project ? { id: project.id } : null,
    source: data.source,
    createdBy: { id: currentUser.userId },
    updatedBy: { id: currentUser.userId },
  });

  // 💰 Bakiye güncellemesi
  await updateCompanyBalanceAfterTransaction(
    data.type,
    fromAccount.id,
    null,
    data.amount,
    manager
  );

  /* 🔄 ORDER */
  if (data.category === "ORDER") {
    console.log("order girdi");
    if (!data.referenceCode) {
      throw new Error("Order işlemi için referenceCode zorunludur.");
    }

    const order = await orderRepo.findOneByOrFail({ code: data.referenceCode });

    transaction.order = { id: order.id } as CompanyOrder;

    await updateOrderPaymentStatusNew(
      data.referenceCode,
      data.amount,
      currentUser,
      manager,
      false
    );
  }

  /* 🔄 CHECK */
  if (data.category === "CHECK") {
    if (!data.referenceCode) {
      throw new Error("Check işlemi için referenceCode zorunludur.");
    }

    const check = await checkRepo.findOneByOrFail({
      code: data.referenceCode,
    });

    transaction.check = { id: check.id } as CompanyCheck;

    await updateCheckPaymentStatusNew(
      data.referenceCode,
      Number(data.amount),
      data.transactionDate,
      currentUser,
      manager,
      false
    );
  }

  /* 🔄 LOAN PAYMENT */
  if (data.category === "LOAN") {
    if (!data.referenceCode) {
      throw new Error("Loan işlemi için referenceCode zorunludur.");
    }

    const loanPayment = await loanPaymentRepo.findOneByOrFail({
      code: data.referenceCode,
    });

    transaction.loanPayment = { id: loanPayment.id } as CompanyLoanPayment;

    await updateLoanPaymentStatusNew(
      data.referenceCode,
      data.amount,
      //data.transactionDate,
      currentUser,
      manager,
      false
    );

    /*const expectedTotal =
    (payment.principalAmount ?? 0) +
    (payment.interestAmount ?? 0) +
    (payment.penaltyAmount ?? 0);*/
  }

  /* 🔄 SUBCONTRACTOR */
  if (data.category === "SUBCONTRACTOR") {
    if (!data.referenceCode) {
      throw new Error("Taşeron işlemi için referenceCode zorunludur.");
    }

    const subcontractor = await subcontractorRepo.findOneByOrFail({
      code: data.referenceCode,
    });

    transaction.subcontractor = {
      id: subcontractor.id,
    } as ProjectSubcontractor;

    await updateProjectSubcontractorStatusNew(
      data.referenceCode,
      data.amount,
      //data.transactionDate,
      currentUser,
      manager,
      false
    );

    /*const expectedTotal =
    (payment.principalAmount ?? 0) +
    (payment.interestAmount ?? 0) +
    (payment.penaltyAmount ?? 0);*/
  }

  /* 🔄 SUPPLIER */
  if (data.category === "SUPPLIER") {
    if (!data.referenceCode) {
      throw new Error("Tedarik işlemi için referenceCode zorunludur.");
    }

    const supplier = await supplierRepo.findOneByOrFail({
      code: data.referenceCode,
    });

    transaction.supplier = {
      id: supplier.id,
    } as ProjectSupplier;

    await updateProjectSupplierStatusNew(
      data.referenceCode,
      data.amount,
      //data.transactionDate,
      currentUser,
      manager,
      false
    );

    /*const expectedTotal =
    (payment.principalAmount ?? 0) +
    (payment.interestAmount ?? 0) +
    (payment.penaltyAmount ?? 0);*/
  }

  /* 🔄 BARTER */
  if (data.category === "BARTER") {
    if (!data.referenceCode) {
      throw new Error("Check işlemi için referenceCode zorunludur.");
    }

    const barterItem = await barterItemRepo.findOneByOrFail({
      code: data.referenceCode,
    });

    transaction.barterItem = {
      id: barterItem.id,
    } as CompanyBarterAgreementItem;

    await updateBarterItemPaymentStatusNew(
      data.referenceCode,
      Number(data.amount),
      currentUser,
      manager,
      false
    );
  }

  /*const saved = await transactionRepo.save(transaction);
  return saved;*/
  return await saveRefetchSanitize({
    entityName: "CompanyFinance",
    save: () => transactionRepo.save(transaction),
    refetch: () =>
      transactionRepo.findOneOrFail({
        where: { id: transaction.id, company: { id: currentUser.companyId } },
        relations: [
          "company",
          "project",
          "fromAccount",
          "toAccount",
          "check",
          "order",
          "loanPayment",
          "subcontractor",
          "supplier",
          "barterItem",
          "createdBy",
          "updatedBy",
        ],
      }),
    rules: sanitizeRules,
    defaultError: "İşlemkaydı oluşturulamadı.",
  });
};

export const updateCompanyFinanceTransaction = async (
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
    referenceCode?: string;
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
  const subcontractorRepo = manager.getRepository(ProjectSubcontractor);
  const supplierRepo = manager.getRepository(ProjectSupplier);
  const checkRepo = manager.getRepository(CompanyCheck);
  const loanPaymentRepo = manager.getRepository(CompanyLoanPayment);
  const barterItemRepo = manager.getRepository(CompanyBarterAgreementItem);
  const orderRepo = manager.getRepository(CompanyOrder);

  const existing = await transactionRepo.findOne({
    where: { id, company: { id: currentUser.companyId } },
    relations: ["fromAccount", "toAccount", "company", "project"],
  });

  //console.log(existing);

  if (!existing) {
    throw new Error("Finansal işlem bulunamadı.");
  }

  // 🔁 Move Back Old Balance
  await updateCompanyBalanceAfterTransaction(
    existing.type,
    existing.fromAccount?.id ?? null,
    existing.toAccount?.id ?? null,
    existing.amount,
    manager,
    true
  );

  // 🔁 Move Back Old Supplier
  if (existing.category === "SUBCONTRACTOR" && existing.referenceCode) {
    await updateProjectSubcontractorStatusNew(
      existing.referenceCode,
      existing.amount,
      currentUser,
      manager,
      true
    );
  }

  // 🔁 Move Back Old Supplier
  if (existing.category === "SUPPLIER" && existing.referenceCode) {
    await updateProjectSupplierStatusNew(
      existing.referenceCode,
      existing.amount,
      currentUser,
      manager,
      true
    );
  }

  // 🔁 Move Back Old Check
  if (existing.category === "CHECK" && existing.referenceCode) {
    console.log("burada");
    await updateCheckPaymentStatusNew(
      existing.referenceCode,
      existing.amount,
      existing.transactionDate,
      currentUser,
      manager,
      true
    );
  }

  // 🔁 Move Back Old Order
  if (existing.category === "ORDER" && existing.referenceCode) {
    await updateOrderPaymentStatusNew(
      existing.referenceCode,
      existing.amount,
      currentUser,
      manager,
      true
    );
  }

  // 🔁 Move Back Old Loan
  if (existing.category === "LOAN" && existing.referenceCode) {
    await updateLoanPaymentStatusNew(
      existing.referenceCode,
      existing.amount,
      currentUser,
      manager,
      true
    );
  }

  // 🔁 Move Back Old Barter
  if (existing.category === "BARTER" && existing.referenceCode) {
    await updateBarterItemPaymentStatusNew(
      existing.referenceCode,
      existing.amount,
      currentUser,
      manager,
      true
    );
  }

  // 🔁 Gerekli ilişkileri getir
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
  existing.project = newProject;
  existing.updatedBy = { id: currentUser.userId } as any;
  existing.updatedatetime = new Date();

  // 💾 Güncelleme
  const updated = await transactionRepo.save(existing);
  console.log(updated.amount, " : ", data.amount, " : ", existing.amount);

  // 🔄 SUBCONTRACTOR
  if (updated.category === "SUBCONTRACTOR" && updated.referenceCode) {
    console.log("enter category statement");
    const subcontractor = await subcontractorRepo.findOneByOrFail({
      code: updated.referenceCode,
    });

    updated.subcontractor = { id: subcontractor.id } as ProjectSubcontractor;

    await updateProjectSubcontractorStatusNew(
      updated.referenceCode,
      updated.amount,
      currentUser,
      manager,
      false
    );

    //await transactionRepo.save(updated);
  }

  // 🔄 SUPPLIER
  if (updated.category === "SUPPLIER" && updated.referenceCode) {
    console.log("enter category statement");
    const supplier = await supplierRepo.findOneByOrFail({
      code: updated.referenceCode,
    });

    updated.supplier = { id: supplier.id } as ProjectSupplier;

    await updateProjectSupplierStatusNew(
      updated.referenceCode,
      updated.amount,
      currentUser,
      manager,
      false
    );

    //await transactionRepo.save(updated);
  }

  // 🔄 CHECK
  if (updated.category === "CHECK" && updated.referenceCode) {
    console.log("enter category statement");
    const check = await checkRepo.findOneByOrFail({
      code: updated.referenceCode,
    });

    updated.check = { id: check.id } as CompanyCheck;

    await updateCheckPaymentStatusNew(
      updated.referenceCode,
      updated.amount,
      updated.transactionDate,
      currentUser,
      manager,
      false
    );

    //await transactionRepo.save(updated);
  }

  // 🔄 ORDER
  if (updated.category === "ORDER" && updated.referenceCode) {
    console.log("enter category statement");
    const order = await orderRepo.findOneByOrFail({
      code: updated.referenceCode,
    });

    updated.order = { id: order.id } as CompanyOrder;

    await updateOrderPaymentStatusNew(
      updated.referenceCode,
      updated.amount,
      currentUser,
      manager,
      false
    );

    //await transactionRepo.save(updated);
  }

  // 🔄 LOAN
  if (updated.category === "LOAN" && updated.referenceCode) {
    console.log("enter category statement");
    const loanPayment = await loanPaymentRepo.findOneByOrFail({
      code: updated.referenceCode,
    });

    updated.loanPayment = { id: loanPayment.id } as CompanyLoanPayment;

    await updateLoanPaymentStatusNew(
      updated.referenceCode,
      updated.amount,
      currentUser,
      manager,
      false
    );

    //await transactionRepo.save(updated); // yeniden kaydet
  }

  // 🔄 BARTER
  if (updated.category === "BARTER" && updated.referenceCode) {
    console.log("enter category statement");
    const barterItem = await barterItemRepo.findOneByOrFail({
      code: updated.referenceCode,
    });

    updated.barterItem = { id: barterItem.id } as CompanyBarterAgreementItem;

    await updateBarterItemPaymentStatusNew(
      updated.referenceCode,
      updated.amount,
      currentUser,
      manager,
      false
    );

    //await transactionRepo.save(updated);
  }

  // 🔁 Yeni bakiyeyi uygula
  await updateCompanyBalanceAfterTransaction(
    updated.type,
    updated.fromAccount?.id ?? null,
    updated.toAccount?.id ?? null,
    updated.amount,
    manager
  );

  //return updated;
  return sanitizeEntity(updated, "CompanyFinance", sanitizeRules);
};

export const updateCompanyFinanceTransactionNew = async (
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
    referenceCode?: string;
    description?: string;
    projectId?: string;
  },
  currentUser: { userId: string; companyId: string },
  manager: EntityManager = AppDataSource.manager
) => {
  const transactionRepo = manager.getRepository(CompanyFinanceTransaction);
  const balanceRepo = manager.getRepository(CompanyBalance);
  const projectRepo = manager.getRepository(CompanyProject);
  const subcontractorRepo = manager.getRepository(ProjectSubcontractor);
  const supplierRepo = manager.getRepository(ProjectSupplier);
  const checkRepo = manager.getRepository(CompanyCheck);
  const loanPaymentRepo = manager.getRepository(CompanyLoanPayment);
  const barterItemRepo = manager.getRepository(CompanyBarterAgreementItem);
  const orderRepo = manager.getRepository(CompanyOrder);

  const existing = await transactionRepo.findOne({
    where: { id, company: { id: currentUser.companyId } },
    relations: ["fromAccount", "toAccount", "company", "project"],
  });

  if (!existing) {
    throw new Error("Finansal işlem bulunamadı.");
  }

  // 1) Mevcut işlemin etkilerini geri al
  await updateCompanyBalanceAfterTransaction(
    existing.type,
    existing.fromAccount?.id ?? null,
    existing.toAccount?.id ?? null,
    existing.amount,
    manager,
    true
  );

  if (existing.category === "SUBCONTRACTOR" && existing.referenceCode) {
    await updateProjectSubcontractorStatusNew(
      existing.referenceCode,
      existing.amount,
      currentUser,
      manager,
      true
    );
  }
  if (existing.category === "SUPPLIER" && existing.referenceCode) {
    await updateProjectSupplierStatusNew(
      existing.referenceCode,
      existing.amount,
      currentUser,
      manager,
      true
    );
  }
  if (existing.category === "CHECK" && existing.referenceCode) {
    await updateCheckPaymentStatusNew(
      existing.referenceCode,
      existing.amount,
      existing.transactionDate,
      currentUser,
      manager,
      true
    );
  }
  if (existing.category === "ORDER" && existing.referenceCode) {
    await updateOrderPaymentStatusNew(
      existing.referenceCode,
      existing.amount,
      currentUser,
      manager,
      true
    );
  }
  if (existing.category === "LOAN" && existing.referenceCode) {
    await updateLoanPaymentStatusNew(
      existing.referenceCode,
      existing.amount,
      currentUser,
      manager,
      true
    );
  }
  if (existing.category === "BARTER" && existing.referenceCode) {
    await updateBarterItemPaymentStatusNew(
      existing.referenceCode,
      existing.amount,
      currentUser,
      manager,
      true
    );
  }

  // 2) Yeni referansları/alanları hazırla
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

  // (Opsiyonel) Tip değişimi TRANSFER ise toAccount zorunlu kuralı
  const nextType = data.type ?? existing.type;
  if (nextType === "TRANSFER" && !(data.toAccountCode || newToAccount?.id)) {
    throw new Error(
      "Transfer tipi için hedef hesap (toAccountCode) zorunludur."
    );
  }

  // 3) Tüm alanları ve İLİŞKİLERİ (ref entity) kayıttan ÖNCE ayarla
  existing.type = nextType;
  existing.amount = data.amount ?? existing.amount;
  existing.currency = data.currency ?? existing.currency;
  existing.fromAccount = newFromAccount;
  existing.toAccount = newToAccount;
  existing.targetType = data.targetType ?? existing.targetType;
  existing.targetId = data.targetId ?? existing.targetId;
  existing.targetName = data.targetName ?? existing.targetName;
  existing.transactionDate = data.transactionDate ?? existing.transactionDate;
  existing.method = data.method ?? existing.method;

  const nextCategory = data.category ?? existing.category;
  const nextRefCode = data.referenceCode ?? existing.referenceCode;

  existing.category = nextCategory;
  existing.invoiceYN = data.invoiceYN ?? existing.invoiceYN;
  existing.invoiceCode = data.invoiceCode ?? existing.invoiceCode;
  existing.referenceCode = nextRefCode;
  existing.description = data.description ?? existing.description;
  existing.project = newProject;
  existing.updatedBy = { id: currentUser.userId } as any;
  existing.updatedatetime = new Date();

  // İlişkisel alanları temizle (stale kalmasın)
  existing.subcontractor = null as any;
  existing.supplier = null as any;
  existing.check = null as any;
  existing.order = null as any;
  existing.loanPayment = null as any;
  existing.barterItem = null as any;

  // Yeni kategoriye göre ilişkiyi ata (SAVE'den önce!)
  if (nextCategory === "SUBCONTRACTOR" && nextRefCode) {
    const sc = await subcontractorRepo.findOneByOrFail({ code: nextRefCode });
    existing.subcontractor = { id: sc.id } as ProjectSubcontractor;
  } else if (nextCategory === "SUPPLIER" && nextRefCode) {
    const sp = await supplierRepo.findOneByOrFail({ code: nextRefCode });
    existing.supplier = { id: sp.id } as ProjectSupplier;
  } else if (nextCategory === "CHECK" && nextRefCode) {
    const ck = await checkRepo.findOneByOrFail({ code: nextRefCode });
    existing.check = { id: ck.id } as CompanyCheck;
  } else if (nextCategory === "ORDER" && nextRefCode) {
    const or = await orderRepo.findOneByOrFail({ code: nextRefCode });
    existing.order = { id: or.id } as CompanyOrder;
  } else if (nextCategory === "LOAN" && nextRefCode) {
    const lp = await loanPaymentRepo.findOneByOrFail({ code: nextRefCode });
    existing.loanPayment = { id: lp.id } as CompanyLoanPayment;
  } else if (nextCategory === "BARTER" && nextRefCode) {
    const bi = await barterItemRepo.findOneByOrFail({ code: nextRefCode });
    existing.barterItem = { id: bi.id } as CompanyBarterAgreementItem;
  }

  // 4) Kaydet + refetch + sanitize (tek yerden)
  const sanitized = await saveRefetchSanitize({
    entityName: "CompanyFinance",
    save: () => transactionRepo.save(existing),
    refetch: () =>
      transactionRepo.findOneOrFail({
        where: { id: existing.id, company: { id: currentUser.companyId } },
        relations: [
          "company",
          "project",
          "fromAccount",
          "toAccount",
          "check",
          "order",
          "loanPayment",
          "subcontractor",
          "supplier",
          "barterItem",
          "createdBy",
          "updatedBy",
        ],
      }),
    rules: sanitizeRules,
    defaultError: "İşlem güncellenemedi.",
  });

  // 5) Yeni etkileri uygula (balans/statü). — Kaydın dönmesini bekletmeden yapıyoruz.
  //    Eğer bu adımların da tamamlanmasını bekleyip ÖYLE dönmek istersen, 'await' bozulmasın (şu an öyle).
  if (nextCategory === "SUBCONTRACTOR" && nextRefCode) {
    await updateProjectSubcontractorStatusNew(
      nextRefCode,
      existing.amount,
      currentUser,
      manager,
      false
    );
  }
  if (nextCategory === "SUPPLIER" && nextRefCode) {
    await updateProjectSupplierStatusNew(
      nextRefCode,
      existing.amount,
      currentUser,
      manager,
      false
    );
  }
  if (nextCategory === "CHECK" && nextRefCode) {
    await updateCheckPaymentStatusNew(
      nextRefCode,
      existing.amount,
      existing.transactionDate,
      currentUser,
      manager,
      false
    );
  }
  if (nextCategory === "ORDER" && nextRefCode) {
    await updateOrderPaymentStatusNew(
      nextRefCode,
      existing.amount,
      currentUser,
      manager,
      false
    );
  }
  if (nextCategory === "LOAN" && nextRefCode) {
    await updateLoanPaymentStatusNew(
      nextRefCode,
      existing.amount,
      currentUser,
      manager,
      false
    );
  }
  if (nextCategory === "BARTER" && nextRefCode) {
    await updateBarterItemPaymentStatusNew(
      nextRefCode,
      existing.amount,
      currentUser,
      manager,
      false
    );
  }

  await updateCompanyBalanceAfterTransaction(
    existing.type,
    existing.fromAccount?.id ?? null,
    existing.toAccount?.id ?? null,
    existing.amount,
    manager
  );

  // 6) İlişkiler dolu, sanitize edilmiş kayıt
  return sanitized;
};

/* WILL BE USED */
/*
export const updateCompanyFinanceTransactionNew = async (
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
    referenceCode?: string;
    description?: string;
    projectId?: string;
  },
  currentUser: { userId: string; companyId: string },
  manager: EntityManager = AppDataSource.manager
) => {
  const transactionRepo = manager.getRepository(CompanyFinanceTransaction);
  const balanceRepo = manager.getRepository(CompanyBalance);
  const projectRepo = manager.getRepository(CompanyProject);
  const subcontractorRepo = manager.getRepository(ProjectSubcontractor);
  const supplierRepo = manager.getRepository(ProjectSupplier);
  const checkRepo = manager.getRepository(CompanyCheck);
  const loanPaymentRepo = manager.getRepository(CompanyLoanPayment);
  const barterItemRepo = manager.getRepository(CompanyBarterAgreementItem);
  const orderRepo = manager.getRepository(CompanyOrder);

  const existing = await transactionRepo.findOne({
    where: { id, company: { id: currentUser.companyId } },
    relations: ["fromAccount", "toAccount", "company", "project"],
  });
  if (!existing) throw new Error("Finansal işlem bulunamadı.");

  // ---- 1) Yeni referansları hazırla (hepsi tenant filtreli!) ----
  const nextType = data.type ?? existing.type;

  const newFromAccount =
    data.fromAccountCode && data.fromAccountCode !== existing.fromAccount?.code
      ? await balanceRepo.findOneOrFail({
          where: { code: data.fromAccountCode, company: { id: currentUser.companyId } },
        })
      : existing.fromAccount;

  const newToAccount =
    data.toAccountCode && data.toAccountCode !== existing.toAccount?.code
      ? await balanceRepo.findOneOrFail({
          where: { code: data.toAccountCode, company: { id: currentUser.companyId } },
        })
      : existing.toAccount;

  const newProject =
    data.projectId && data.projectId !== existing.project?.id
      ? await projectRepo.findOneOrFail({
          where: { id: data.projectId, company: { id: currentUser.companyId } },
        })
      : existing.project;

  if (nextType === "TRANSFER" && !(data.toAccountCode || newToAccount?.id)) {
    throw new Error("Transfer tipi için hedef hesap (toAccountCode) zorunludur.");
  }

  const nextCategory = data.category ?? existing.category;
  const nextRefCode = data.referenceCode ?? existing.referenceCode;

  // ---- 2) Değişim tespiti (sadece gerekirse revert/apply) ----
  const balanceChanged =
    (data.amount !== undefined && data.amount !== existing.amount) ||
    (data.fromAccountCode && data.fromAccountCode !== existing.fromAccount?.code) ||
    (data.toAccountCode && data.toAccountCode !== existing.toAccount?.code) ||
    (data.type && data.type !== existing.type);

  const refChanged =
    (data.category && data.category !== existing.category) ||
    (data.referenceCode && data.referenceCode !== existing.referenceCode) ||
    // CHECK statü hesapları genelde tarihe duyarlı
    (nextCategory === "CHECK" && data.transactionDate && data.transactionDate !== existing.transactionDate);

  // ---- 3) Eski etkileri GERİ AL (yalnızca gerektiğinde) ----
  if (balanceChanged || refChanged) {
    await updateCompanyBalanceAfterTransaction(
      existing.type,
      existing.fromAccount?.id ?? null,
      existing.toAccount?.id ?? null,
      existing.amount,
      manager,
      true
    );

    if (existing.category === "SUBCONTRACTOR" && existing.referenceCode) {
      await updateProjectSubcontractorStatusNew(
        existing.referenceCode,
        existing.amount,
        currentUser,
        manager,
        true
      );
    }
    if (existing.category === "SUPPLIER" && existing.referenceCode) {
      await updateProjectSupplierStatusNew(
        existing.referenceCode,
        existing.amount,
        currentUser,
        manager,
        true
      );
    }
    if (existing.category === "CHECK" && existing.referenceCode) {
      await updateCheckPaymentStatusNew(
        existing.referenceCode,
        existing.amount,
        existing.transactionDate,
        currentUser,
        manager,
        true
      );
    }
    if (existing.category === "ORDER" && existing.referenceCode) {
      await updateOrderPaymentStatusNew(
        existing.referenceCode,
        existing.amount,
        currentUser,
        manager,
        true
      );
    }
    if (existing.category === "LOAN" && existing.referenceCode) {
      await updateLoanPaymentStatusNew(
        existing.referenceCode,
        existing.amount,
        currentUser,
        manager,
        true
      );
    }
    if (existing.category === "BARTER" && existing.referenceCode) {
      await updateBarterItemPaymentStatusNew(
        existing.referenceCode,
        existing.amount,
        currentUser,
        manager,
        true
      );
    }
  }

  // ---- 4) Tüm alanları ve ilişkileri SAVE’DEN ÖNCE ayarla ----
  existing.type = nextType;
  existing.amount = data.amount ?? existing.amount;
  existing.currency = data.currency ?? existing.currency;
  existing.fromAccount = newFromAccount;
  existing.toAccount = nextType === "TRANSFER" ? newToAccount : null; // TRANSFER değilse temizle
  existing.targetType = data.targetType ?? existing.targetType;
  existing.targetId = data.targetId ?? existing.targetId;
  existing.targetName = data.targetName ?? existing.targetName;
  existing.transactionDate = data.transactionDate ?? existing.transactionDate;
  existing.method = data.method ?? existing.method;

  existing.category = nextCategory;
  existing.invoiceYN = data.invoiceYN ?? existing.invoiceYN;
  existing.invoiceCode = data.invoiceCode ?? existing.invoiceCode;
  existing.referenceCode = nextRefCode;
  existing.description = data.description ?? existing.description;
  existing.project = newProject;
  existing.updatedBy = { id: currentUser.userId } as any;
  existing.updatedatetime = new Date();

  // Kategori alternatiftir: eski FK’ları NULL’a çek
  existing.subcontractor = null as any;
  existing.supplier = null as any;
  existing.check = null as any;
  existing.order = null as any;
  existing.loanPayment = null as any;
  existing.barterItem = null as any;

  // Yeni kategoriye göre ilişkiyi (tenant filtreli) ata
  if (nextCategory === "SUBCONTRACTOR" && nextRefCode) {
    const sc = await subcontractorRepo.findOneOrFail({
      where: { code: nextRefCode, company: { id: currentUser.companyId } },
    });
    existing.subcontractor = { id: sc.id } as ProjectSubcontractor;
  } else if (nextCategory === "SUPPLIER" && nextRefCode) {
    const sp = await supplierRepo.findOneOrFail({
      where: { code: nextRefCode, company: { id: currentUser.companyId } },
    });
    existing.supplier = { id: sp.id } as ProjectSupplier;
  } else if (nextCategory === "CHECK" && nextRefCode) {
    const ck = await checkRepo.findOneOrFail({
      where: { code: nextRefCode, company: { id: currentUser.companyId } },
    });
    existing.check = { id: ck.id } as CompanyCheck;
  } else if (nextCategory === "ORDER" && nextRefCode) {
    const or = await orderRepo.findOneOrFail({
      where: { code: nextRefCode, company: { id: currentUser.companyId } },
    });
    existing.order = { id: or.id } as CompanyOrder;
  } else if (nextCategory === "LOAN" && nextRefCode) {
    const lp = await loanPaymentRepo.findOneOrFail({
      where: { code: nextRefCode, company: { id: currentUser.companyId } },
    });
    existing.loanPayment = { id: lp.id } as CompanyLoanPayment;
  } else if (nextCategory === "BARTER" && nextRefCode) {
    const bi = await barterItemRepo.findOneOrFail({
      where: { code: nextRefCode, company: { id: currentUser.companyId } },
    });
    existing.barterItem = { id: bi.id } as CompanyBarterAgreementItem;
  }

  // ---- 5) Kaydet + refetch + sanitize (tek noktadan) ----
  const sanitized = await saveRefetchSanitize({
    entityName: "CompanyFinance",
    save: () => transactionRepo.save(existing),
    refetch: () =>
      transactionRepo.findOneOrFail({
        where: { id: existing.id, company: { id: currentUser.companyId } },
        relations: [
          "company",
          "project",
          "fromAccount",
          "toAccount",
          "check",
          "order",
          "loanPayment",
          "subcontractor",
          "supplier",
          "barterItem",
          "createdBy",
          "updatedBy",
        ],
      }),
    rules: sanitizeRules,
    defaultError: "İşlem güncellenemedi.",
  });

  // ---- 6) Yeni etkileri uygula (yalnızca gerektiğinde) ----
  if (balanceChanged || refChanged) {
    if (nextCategory === "SUBCONTRACTOR" && nextRefCode) {
      await updateProjectSubcontractorStatusNew(
        nextRefCode,
        existing.amount,
        currentUser,
        manager,
        false
      );
    }
    if (nextCategory === "SUPPLIER" && nextRefCode) {
      await updateProjectSupplierStatusNew(
        nextRefCode,
        existing.amount,
        currentUser,
        manager,
        false
      );
    }
    if (nextCategory === "CHECK" && nextRefCode) {
      await updateCheckPaymentStatusNew(
        nextRefCode,
        existing.amount,
        existing.transactionDate,
        currentUser,
        manager,
        false
      );
    }
    if (nextCategory === "ORDER" && nextRefCode) {
      await updateOrderPaymentStatusNew(
        nextRefCode,
        existing.amount,
        currentUser,
        manager,
        false
      );
    }
    if (nextCategory === "LOAN" && nextRefCode) {
      await updateLoanPaymentStatusNew(
        nextRefCode,
        existing.amount,
        currentUser,
        manager,
        false
      );
    }
    if (nextCategory === "BARTER" && nextRefCode) {
      await updateBarterItemPaymentStatusNew(
        nextRefCode,
        existing.amount,
        currentUser,
        manager,
        false
      );
    }

    await updateCompanyBalanceAfterTransaction(
      existing.type,
      existing.fromAccount?.id ?? null,
      existing.toAccount?.id ?? null,
      existing.amount,
      manager
    );
  }

  return sanitized;
};
*/
