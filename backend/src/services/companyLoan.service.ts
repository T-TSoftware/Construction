import { EntityManager } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { CompanyLoan } from "../entities/CompanyLoan";
import { CompanyBalance } from "../entities/CompanyBalance";
import { CompanyProject } from "../entities/CompanyProject";
import { saveRefetchSanitize } from "../utils/persist";
import { sanitizeRules } from "../utils/sanitizeRules";
import { sanitizeEntity } from "../utils/sanitize";
import { generateEntityCode } from "../utils/generateCode";

export const createCompanyLoan = async (
  data: {
    code: string;
    name: string;
    accountNo: string;
    bankId: string;
    projectId?: string;
    totalAmount: number;
    remainingPrincipal: number;
    remainingInstallmentAmount: number;
    currency: string;
    interestRate: number;
    totalInstallmentCount: number;
    remainingInstallmentCount: number;
    loanDate: Date;
    purpose?: string;
    loanType?: string;
    status?: "ACTIVE" | "CLOSED" | "CANCELED";
    description?: string;
  },
  currentUser: { userId: string; companyId: string },
  manager: EntityManager = AppDataSource.manager
) => {
  const loanRepo = manager.getRepository(CompanyLoan);
  const balanceRepo = manager.getRepository(CompanyBalance);
  const projectRepo = manager.getRepository(CompanyProject);

  const bank = await balanceRepo.findOneByOrFail({
    id: data.bankId,
    company: { id: currentUser.companyId },
  });

  // 2. Project opsiyonel
  const project = data.projectId
    ? await projectRepo.findOneByOrFail({
        id: data.projectId,
        company: { id: currentUser.companyId },
      })
    : null;


  /*const code = `KRD-${data.name
    .toUpperCase()
    .replace(/\s+/g, "-") // boşlukları tireye çevir
    .replace(/[^A-Z0-9\-]/g, "")}`; // Türkçe karakterleri, özel sembolleri vs. temizle
    */

  const code = await generateEntityCode(
    manager,
    currentUser.companyId,
    "CompanyLoan"
  );

  const loan = loanRepo.create({
    code, //data.code,
    name: data.name,
    accountNo: data.accountNo,
    bank: { id: bank.id },
    project: project ? { id: project.id } : null,
    totalAmount: data.totalAmount,
    remainingPrincipal: data.totalAmount, //data.remainingPrincipal ?? data.totalAmount,
    remainingInstallmentAmount: data.remainingInstallmentAmount,
    currency: data.currency,
    interestRate: data.interestRate,
    totalInstallmentCount: data.totalInstallmentCount,
    remainingInstallmentCount: data.totalInstallmentCount,
    loanDate: data.loanDate,
    purpose: data.purpose,
    loanType: data.loanType,
    status: data.status ?? "ACTIVE",
    description: data.description,
    company: { id: currentUser.companyId },
    createdBy: { id: currentUser.userId },
    updatedBy: { id: currentUser.userId },
  });

  //return await loanRepo.save(loan);
  return await saveRefetchSanitize({
    entityName: "CompanyLoan",
    save: () => loanRepo.save(loan),
    refetch: () =>
      loanRepo.findOneOrFail({
        where: { id: loan.id, company: { id: currentUser.companyId } },
        relations: ["bank", "project", "company", "createdBy", "updatedBy"],
      }),
    rules: sanitizeRules,
    defaultError: "Kredi kaydı oluşturulamadı.",
  });
};

export const updateCompanyLoanPaymentChange = async (
  loanId: string,
  principalAmount: number,
  interestAmount: number,
  paymentAmount: number,
  userId: string,
  manager: EntityManager,
  isReverse: boolean = false
) => {
  const repo = manager.getRepository(CompanyLoan);

  const factor = isReverse ? 1 : -1;

  // 🔻 remainingPrincipal azaltılır
  await repo.increment(
    { id: loanId },
    "remainingPrincipal",
    factor * principalAmount
  );
  console.log(
    `${isReverse ? "REVERSE" : "APPLY"} remainingPrincipal: ${
      factor * principalAmount
    }`
  );

  // 🔻 remainingInstallmentAmount azaltılır
  await repo.increment(
    { id: loanId },
    "remainingInstallmentAmount",
    factor * paymentAmount
  );
  console.log(
    `${isReverse ? "REVERSE" : "APPLY"} remainingInstallmentAmount: ${
      factor * paymentAmount
    }`
  );
  /*await repo.increment(
    { id: loanId },
    "remainingInstallmentAmount",
    factor * (principalAmount + interestAmount)
  );
  console.log(
    `${isReverse ? "REVERSE" : "APPLY"} remainingInstallmentAmount: ${
      factor * (principalAmount + interestAmount)
    }`
  );*/

  // 🔻 remainingInstallmentCount azaltılır
  await repo.increment({ id: loanId }, "remainingInstallmentCount", factor * 1);
  console.log(
    `${isReverse ? "REVERSE" : "APPLY"} remainingInstallmentCount: ${
      factor * 1
    }`
  );

  // ❗ status kontrolü — TypeORM ile direkt değiştirme
  const loan = await repo.findOneByOrFail({ id: loanId });
  const newCount = loan.remainingInstallmentCount + factor * 1;
  const newStatus = newCount <= 0 ? "CLOSED" : "ACTIVE";

  await repo.update(
    { id: loanId },
    {
      status: newStatus,
      updatedBy: { id: userId },
      updatedatetime: new Date(),
    }
  );
  console.log(`→ STATUS set to: ${newStatus}`);
};

export const getCompanyLoans = async (
  currentUser: { userId: string; companyId: string },
  manager: EntityManager = AppDataSource.manager
) => {
  const repo = manager.getRepository(CompanyLoan);

  const loans = await repo.find({
    where: {
      company: { id: currentUser.companyId },
    },
    relations: ["company", "bank", "project", "createdBy", "updatedBy"],
    order: { createdatetime: "DESC" },
  });

  //return loans;
  return sanitizeEntity(loans, "CompanyLoan", sanitizeRules);
};

export const getCompanyLoanById = async (
  id: string,
  currentUser: { userId: string; companyId: string },
  manager: EntityManager = AppDataSource.manager
) => {
  const repo = manager.getRepository(CompanyLoan);

  const loan = await repo.findOne({
    where: {
      id,
      company: { id: currentUser.companyId },
    },
    relations: ["company", "bank", "project", "createdBy", "updatedBy"],
  });

  if (!loan) {
    throw new Error("İlgili çek bulunamadı.");
  }

  //return loan;
  return sanitizeEntity(loan, "CompanyLoan", sanitizeRules);
};
