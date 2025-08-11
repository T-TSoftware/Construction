"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompanyLoanById = exports.getCompanyLoans = exports.updateCompanyLoanPaymentChange = exports.createCompanyLoan = void 0;
const data_source_1 = require("../config/data-source");
const CompanyLoan_1 = require("../entities/CompanyLoan");
const CompanyBalance_1 = require("../entities/CompanyBalance");
const CompanyProject_1 = require("../entities/CompanyProject");
const createCompanyLoan = async (data, currentUser, manager = data_source_1.AppDataSource.manager) => {
    const loanRepo = manager.getRepository(CompanyLoan_1.CompanyLoan);
    const balanceRepo = manager.getRepository(CompanyBalance_1.CompanyBalance);
    const projectRepo = manager.getRepository(CompanyProject_1.CompanyProject);
    const bank = await balanceRepo.findOneByOrFail({
        id: data.bankId,
        company: { id: currentUser.companyId },
    });
    // 2. Project opsiyonel
    let project = null;
    if (data.projectId) {
        project = await projectRepo.findOneOrFail({
            where: {
                id: data.projectId,
                company: { id: currentUser.companyId },
            },
        });
    }
    const code = `KRD-${data.name
        .toUpperCase()
        .replace(/\s+/g, "-") // boşlukları tireye çevir
        .replace(/[^A-Z0-9\-]/g, "")}`; // Türkçe karakterleri, özel sembolleri vs. temizle
    const loan = loanRepo.create({
        code, //data.code,
        name: data.name,
        accountNo: data.accountNo,
        bank: { id: bank.id },
        project: project ? { id: project.id } : null,
        totalAmount: data.totalAmount,
        remainingPrincipal: data.remainingPrincipal ?? data.totalAmount,
        remainingInstallmentAmount: data.remainingInstallmentAmount,
        currency: data.currency,
        interestRate: data.interestRate,
        totalInstallmentCount: data.totalInstallmentCount,
        remainingInstallmentCount: data.remainingInstallmentCount ?? data.totalInstallmentCount,
        loanDate: data.loanDate,
        purpose: data.purpose,
        loanType: data.loanType,
        status: data.status ?? "ACTIVE",
        description: data.description,
        company: { id: currentUser.companyId },
        createdBy: { id: currentUser.userId },
        updatedBy: { id: currentUser.userId },
    });
    return await loanRepo.save(loan);
};
exports.createCompanyLoan = createCompanyLoan;
const updateCompanyLoanPaymentChange = async (loanId, principalAmount, interestAmount, paymentAmount, userId, manager, isReverse = false) => {
    const repo = manager.getRepository(CompanyLoan_1.CompanyLoan);
    const factor = isReverse ? 1 : -1;
    // 🔻 remainingPrincipal azaltılır
    await repo.increment({ id: loanId }, "remainingPrincipal", factor * principalAmount);
    console.log(`${isReverse ? "REVERSE" : "APPLY"} remainingPrincipal: ${factor * principalAmount}`);
    // 🔻 remainingInstallmentAmount azaltılır
    await repo.increment({ id: loanId }, "remainingInstallmentAmount", factor * paymentAmount);
    console.log(`${isReverse ? "REVERSE" : "APPLY"} remainingInstallmentAmount: ${factor * paymentAmount}`);
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
    console.log(`${isReverse ? "REVERSE" : "APPLY"} remainingInstallmentCount: ${factor * 1}`);
    // ❗ status kontrolü — TypeORM ile direkt değiştirme
    const loan = await repo.findOneByOrFail({ id: loanId });
    const newCount = loan.remainingInstallmentCount + factor * 1;
    const newStatus = newCount <= 0 ? "CLOSED" : "ACTIVE";
    await repo.update({ id: loanId }, {
        status: newStatus,
        updatedBy: { id: userId },
        updatedatetime: new Date(),
    });
    console.log(`→ STATUS set to: ${newStatus}`);
};
exports.updateCompanyLoanPaymentChange = updateCompanyLoanPaymentChange;
const getCompanyLoans = async (currentUser, manager = data_source_1.AppDataSource.manager) => {
    const repo = manager.getRepository(CompanyLoan_1.CompanyLoan);
    const loans = await repo.find({
        where: {
            company: { id: currentUser.companyId },
        },
        relations: ["company", "bank", "project"],
        order: { createdatetime: "DESC" },
    });
    return loans;
};
exports.getCompanyLoans = getCompanyLoans;
const getCompanyLoanById = async (id, currentUser, manager = data_source_1.AppDataSource.manager) => {
    const repo = manager.getRepository(CompanyLoan_1.CompanyLoan);
    const loan = await repo.findOne({
        where: {
            id,
            company: { id: currentUser.companyId },
        },
        relations: ["company", "bank", "project"],
    });
    if (!loan) {
        throw new Error("İlgili çek bulunamadı.");
    }
    return loan;
};
exports.getCompanyLoanById = getCompanyLoanById;
