import { EntityManager } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { CompanyLoanPayment } from "../entities/CompanyLoanPayment";
import { CompanyLoan } from "../entities/CompanyLoan";
import { CompanyFinanceTransaction } from "../entities/CompanyFinance";
import { createLoanTransactionFromPaymentData } from "./companyFinance.service";
import { updateCompanyLoan } from "./companyLoan.service";

export const createCompanyLoanPayment = async (
  data: {
    loanCode: string;
    code: string;
    installmentNumber: number;
    dueDate: Date;
    totalAmount: number;
    interestAmount: number;
    principalAmount: number;
    paymentAmount?: number;
    status?: "PENDING" | "PAID" | "OVERDUE";
    paymentDate?: Date;
    penaltyAmount?: number;
    description?: string;
  },
  currentUser: { userId: string; companyId: string },
  manager: EntityManager = AppDataSource.manager
): Promise<CompanyLoanPayment> => {
  const loanRepo = manager.getRepository(CompanyLoan);
  const paymentRepo = manager.getRepository(CompanyLoanPayment);

  const loan = await loanRepo.findOneOrFail({
    where: { code: data.loanCode, company: { id: currentUser.companyId } },
    relations: ["bank", "project"],
  });

  // 💸 Duruma göre otomatik finansal işlem oluştur
  let transaction = null;
  if (data.status === "PAID") {
    transaction = await createLoanTransactionFromPaymentData(
      {
        paymentCode: `${data.loanCode}-TAKSIT:${data.installmentNumber}`,
        amount: data.paymentAmount ?? data.totalAmount,
        transactionDate: data.paymentDate ?? new Date(),
        bankId: loan.bank.id,
        loanName: loan.name,
        installmentNumber: data.installmentNumber,
        projectId: loan.project?.id,
        description: data.description,
      },
      currentUser,
      manager
    );

    await updateCompanyLoan(
      loan.id,
      data.principalAmount,
      data.interestAmount,
      currentUser.userId,
      manager
    );
  }

  // 🧾 LoanPayment oluşturuluyor
  const payment = paymentRepo.create({
    loan: { id: loan.id },
    code: `${data.loanCode}-TAKSIT:${data.installmentNumber}`,
    installmentNumber: data.installmentNumber,
    dueDate: data.dueDate,
    totalAmount: data.totalAmount,
    interestAmount: data.interestAmount,
    principalAmount: data.principalAmount,
    paymentAmount: data.paymentAmount,
    penaltyAmount: data.penaltyAmount,
    status: data.status ?? "PENDING",
    paymentDate: data.paymentDate,
    financeTransaction: transaction ?? undefined,
    createdBy: { id: currentUser.userId },
    updatedBy: { id: currentUser.userId },
  });

  return await paymentRepo.save(payment);
};

export const getCompanyLoanPayments = async (
  currentUser: { userId: string; companyId: string },
  manager: EntityManager = AppDataSource.manager
) => {
  const repo = manager.getRepository(CompanyLoanPayment);

  const transactions = await repo.find({
    where: {
      loan: { company: { id: currentUser.companyId } },
    },
    relations: ["loan", "loan.project", "loan.bank", "financeTransaction"],
    order: { installmentNumber: "ASC" },
  });

  return transactions;
};

export const getCompanyLoanPaymentById = async (
  id: string,
  currentUser: { userId: string; companyId: string },
  manager: EntityManager = AppDataSource.manager
) => {
  const repo = manager.getRepository(CompanyLoanPayment);

  const payment = await repo.findOne({
    where: {
      id,
      loan: { company: { id: currentUser.companyId } },
    },
    relations: ["loan", "loan.project", "loan.bank", "financeTransaction"],
  });

  if (!payment) {
    throw new Error("İlgili kredi taksiti bulunamadı.");
  }

  return payment;
};
