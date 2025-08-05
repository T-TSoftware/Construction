import { EntityManager } from "typeorm";
import { CompanyFinanceTransaction } from "../entities/CompanyFinance";
import { CompanyBalance } from "../entities/CompanyBalance";
import { CompanyProject } from "../entities/CompanyProject";

import { AppDataSource } from "../config/data-source";

// Eğer ayrı bir dosyada tutuyorsan import edebilirsin
import { generateFinanceTransactionCode } from "../utils/generateCode";
import { CompanyOrder } from "../entities/CompanyOrder";
import { updateOrderPaymentStatus } from "./companyOrder.service";
import { updateCompanyBalanceAfterTransaction } from "./companyFinance.service";
import { CompanyCheck } from "../entities/CompanyCheck";
import { User } from "../entities/User";
import { updateCompanyLoanPaymentChange } from "./companyLoan.service";
import { CompanyLoanPayment } from "../entities/CompanyLoanPayment";
import { updateLoanPaymentStatus } from "./companyLoanPayment.service";
import { updateCheckPaymentStatus } from "./companyCheck.service";
import { ProjectSubcontractor } from "../entities/ProjectSubcontractor";
import { ProjectSupplier } from "../entities/ProjectSupplier";
import { updateProjectSubcontractorStatus } from "./projectSubcontractor.service";
import { updateProjectSupplierStatus } from "./projectSupplier.service";
import { updateBarterItemPaymentStatus } from "./companyBarterAgreementItem.service";
import { CompanyBarterAgreementItem } from "../entities/CompanyBarterAgreementItem";

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
    projectCode?: string;
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

  const project = data.projectCode
    ? await projectRepo.findOneByOrFail({ code: data.projectCode })
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

    await updateOrderPaymentStatus(
      data.referenceCode,
      data.amount,
      currentUser,
      manager
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

    await updateCheckPaymentStatus(
      data.referenceCode,
      Number(data.amount),
      currentUser,
      manager
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

    await updateLoanPaymentStatus(
      data.referenceCode,
      data.amount,
      data.transactionDate,
      currentUser,
      manager
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

    await updateProjectSubcontractorStatus(
      data.referenceCode,
      data.amount,
      //data.transactionDate,
      currentUser,
      manager
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

    await updateProjectSupplierStatus(
      data.referenceCode,
      data.amount,
      //data.transactionDate,
      currentUser,
      manager
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

    await updateBarterItemPaymentStatus(
      data.referenceCode,
      Number(data.amount),
      currentUser,
      manager
    );
  }

  const saved = await transactionRepo.save(transaction);
  return saved;
};
