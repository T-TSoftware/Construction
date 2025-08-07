"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCompanyFinanceTransaction = exports.createCompanyFinanceTransaction = void 0;
const CompanyFinance_1 = require("../entities/CompanyFinance");
const CompanyBalance_1 = require("../entities/CompanyBalance");
const CompanyProject_1 = require("../entities/CompanyProject");
const data_source_1 = require("../config/data-source");
// Eğer ayrı bir dosyada tutuyorsan import edebilirsin
const generateCode_1 = require("../utils/generateCode");
const CompanyOrder_1 = require("../entities/CompanyOrder");
const companyOrder_service_1 = require("./companyOrder.service");
const companyFinance_service_1 = require("./companyFinance.service");
const CompanyCheck_1 = require("../entities/CompanyCheck");
const CompanyLoanPayment_1 = require("../entities/CompanyLoanPayment");
const companyLoanPayment_service_1 = require("./companyLoanPayment.service");
const companyCheck_service_1 = require("./companyCheck.service");
const ProjectSubcontractor_1 = require("../entities/ProjectSubcontractor");
const ProjectSupplier_1 = require("../entities/ProjectSupplier");
const projectSubcontractor_service_1 = require("./projectSubcontractor.service");
const projectSupplier_service_1 = require("./projectSupplier.service");
const companyBarterAgreementItem_service_1 = require("./companyBarterAgreementItem.service");
const CompanyBarterAgreementItem_1 = require("../entities/CompanyBarterAgreementItem");
const transactionRepo = data_source_1.AppDataSource.getRepository(CompanyFinance_1.CompanyFinanceTransaction);
const balanceRepo = data_source_1.AppDataSource.getRepository(CompanyBalance_1.CompanyBalance);
const projectRepo = data_source_1.AppDataSource.getRepository(CompanyProject_1.CompanyProject);
const createCompanyFinanceTransaction = async (data, currentUser, manager = data_source_1.AppDataSource.manager) => {
    const transactionRepo = manager.getRepository(CompanyFinance_1.CompanyFinanceTransaction);
    const balanceRepo = manager.getRepository(CompanyBalance_1.CompanyBalance);
    const projectRepo = manager.getRepository(CompanyProject_1.CompanyProject);
    const orderRepo = manager.getRepository(CompanyOrder_1.CompanyOrder);
    const checkRepo = manager.getRepository(CompanyCheck_1.CompanyCheck);
    const loanPaymentRepo = manager.getRepository(CompanyLoanPayment_1.CompanyLoanPayment);
    const subcontractorRepo = manager.getRepository(ProjectSubcontractor_1.ProjectSubcontractor);
    const supplierRepo = manager.getRepository(ProjectSupplier_1.ProjectSupplier);
    const barterItemRepo = manager.getRepository(CompanyBarterAgreementItem_1.CompanyBarterAgreementItem);
    const fromAccount = await balanceRepo.findOneByOrFail({
        code: data.fromAccountCode,
    });
    const project = data.projectCode
        ? await projectRepo.findOneByOrFail({ code: data.projectCode })
        : null;
    const results = [];
    // 🔁 TRANSFER işlemi → çift kayıt (OUT & IN)
    if (data.type === "TRANSFER") {
        if (!data.toAccountCode) {
            throw new Error("Transfer için toAccountCode zorunludur.");
        }
        const toAccount = await balanceRepo.findOneByOrFail({
            code: data.toAccountCode,
        });
        const outCode = await (0, generateCode_1.generateFinanceTransactionCode)("TRANSFER", data.transactionDate, manager, "OUT");
        const inCode = await (0, generateCode_1.generateFinanceTransactionCode)("TRANSFER", data.transactionDate, manager, "IN");
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
        results.push(await transactionRepo.save(outTransaction), await transactionRepo.save(inTransaction));
        await (0, companyFinance_service_1.updateCompanyBalanceAfterTransaction)("TRANSFER", fromAccount.id, toAccount.id, data.amount, manager);
        return results;
    }
    // 💳 PAYMENT / COLLECTION işlemi
    const code = await (0, generateCode_1.generateFinanceTransactionCode)(data.type, data.transactionDate, manager);
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
    await (0, companyFinance_service_1.updateCompanyBalanceAfterTransaction)(data.type, fromAccount.id, null, data.amount, manager);
    /* 🔄 ORDER */
    if (data.category === "ORDER") {
        console.log("order girdi");
        if (!data.referenceCode) {
            throw new Error("Order işlemi için referenceCode zorunludur.");
        }
        const order = await orderRepo.findOneByOrFail({ code: data.referenceCode });
        transaction.order = { id: order.id };
        await (0, companyOrder_service_1.updateOrderPaymentStatus)(data.referenceCode, data.amount, currentUser, manager);
    }
    /* 🔄 CHECK */
    if (data.category === "CHECK") {
        if (!data.referenceCode) {
            throw new Error("Check işlemi için referenceCode zorunludur.");
        }
        const check = await checkRepo.findOneByOrFail({
            code: data.referenceCode,
        });
        transaction.check = { id: check.id };
        await (0, companyCheck_service_1.updateCheckPaymentStatus)(data.referenceCode, Number(data.amount), currentUser, manager);
    }
    /* 🔄 LOAN PAYMENT */
    if (data.category === "LOAN") {
        if (!data.referenceCode) {
            throw new Error("Loan işlemi için referenceCode zorunludur.");
        }
        const loanPayment = await loanPaymentRepo.findOneByOrFail({
            code: data.referenceCode,
        });
        transaction.loanPayment = { id: loanPayment.id };
        await (0, companyLoanPayment_service_1.updateLoanPaymentStatus)(data.referenceCode, data.amount, data.transactionDate, currentUser, manager);
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
        };
        await (0, projectSubcontractor_service_1.updateProjectSubcontractorStatus)(data.referenceCode, data.amount, 
        //data.transactionDate,
        currentUser, manager);
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
        };
        await (0, projectSupplier_service_1.updateProjectSupplierStatus)(data.referenceCode, data.amount, 
        //data.transactionDate,
        currentUser, manager);
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
        };
        await (0, companyBarterAgreementItem_service_1.updateBarterItemPaymentStatus)(data.referenceCode, Number(data.amount), currentUser, manager);
    }
    const saved = await transactionRepo.save(transaction);
    return saved;
};
exports.createCompanyFinanceTransaction = createCompanyFinanceTransaction;
const updateCompanyFinanceTransaction = async (id, data, currentUser, manager = data_source_1.AppDataSource.manager) => {
    const transactionRepo = manager.getRepository(CompanyFinance_1.CompanyFinanceTransaction);
    const balanceRepo = manager.getRepository(CompanyBalance_1.CompanyBalance);
    const projectRepo = manager.getRepository(CompanyProject_1.CompanyProject);
    const subcontractorRepo = manager.getRepository(ProjectSubcontractor_1.ProjectSubcontractor);
    const supplierRepo = manager.getRepository(ProjectSupplier_1.ProjectSupplier);
    const checkRepo = manager.getRepository(CompanyCheck_1.CompanyCheck);
    const loanPaymentRepo = manager.getRepository(CompanyLoanPayment_1.CompanyLoanPayment);
    const barterItemRepo = manager.getRepository(CompanyBarterAgreementItem_1.CompanyBarterAgreementItem);
    const orderRepo = manager.getRepository(CompanyOrder_1.CompanyOrder);
    const existing = await transactionRepo.findOne({
        where: { id, company: { id: currentUser.companyId } },
        relations: ["fromAccount", "toAccount", "company", "project"],
    });
    //console.log(existing);
    if (!existing) {
        throw new Error("Finansal işlem bulunamadı.");
    }
    // 🔁 Move Back Old Balance
    await (0, companyFinance_service_1.updateCompanyBalanceAfterTransaction)(existing.type, existing.fromAccount?.id ?? null, existing.toAccount?.id ?? null, existing.amount, manager, true);
    // 🔁 Move Back Old Supplier
    if (existing.category === "SUBCONTRACTOR" && existing.referenceCode) {
        await (0, projectSubcontractor_service_1.updateProjectSubcontractorStatusNew)(existing.referenceCode, existing.amount, currentUser, manager, true);
    }
    // 🔁 Move Back Old Supplier
    if (existing.category === "SUPPLIER" && existing.referenceCode) {
        await (0, projectSupplier_service_1.updateProjectSupplierStatusNew)(existing.referenceCode, existing.amount, currentUser, manager, true);
    }
    // 🔁 Move Back Old Check
    if (existing.category === "CHECK" && existing.referenceCode) {
        await (0, companyCheck_service_1.updateCheckPaymentStatusNew)(existing.referenceCode, existing.amount, currentUser, manager, true);
    }
    // 🔁 Move Back Old Order
    if (existing.category === "ORDER" && existing.referenceCode) {
        await (0, companyOrder_service_1.updateOrderPaymentStatusNew)(existing.referenceCode, existing.amount, currentUser, manager, true);
    }
    // 🔁 Move Back Old Loan
    if (existing.category === "LOAN" && existing.referenceCode) {
        await (0, companyLoanPayment_service_1.updateLoanPaymentStatusNew)(existing.referenceCode, existing.amount, currentUser, manager, true);
    }
    // 🔁 Move Back Old Barter
    if (existing.category === "BARTER" && existing.referenceCode) {
        await (0, companyBarterAgreementItem_service_1.updateBarterItemPaymentStatusNew)(existing.referenceCode, existing.amount, currentUser, manager, true);
    }
    // 🔁 Gerekli ilişkileri getir
    const newFromAccount = data.fromAccountCode && data.fromAccountCode !== existing.fromAccount?.code
        ? await balanceRepo.findOneByOrFail({ code: data.fromAccountCode })
        : existing.fromAccount;
    const newToAccount = data.toAccountCode && data.toAccountCode !== existing.toAccount?.code
        ? await balanceRepo.findOneByOrFail({ code: data.toAccountCode })
        : existing.toAccount;
    const newProject = data.projectCode && data.projectCode !== existing.project?.id
        ? await projectRepo.findOneByOrFail({ code: data.projectCode })
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
    existing.updatedBy = { id: currentUser.userId };
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
        updated.subcontractor = { id: subcontractor.id };
        await (0, projectSubcontractor_service_1.updateProjectSubcontractorStatusNew)(updated.referenceCode, updated.amount, currentUser, manager, false);
        //await transactionRepo.save(updated);
    }
    // 🔄 SUPPLIER
    if (updated.category === "SUPPLIER" && updated.referenceCode) {
        console.log("enter category statement");
        const supplier = await supplierRepo.findOneByOrFail({
            code: updated.referenceCode,
        });
        updated.supplier = { id: supplier.id };
        await (0, projectSupplier_service_1.updateProjectSupplierStatusNew)(updated.referenceCode, updated.amount, currentUser, manager, false);
        //await transactionRepo.save(updated);
    }
    // 🔄 CHECK
    if (updated.category === "CHECK" && updated.referenceCode) {
        console.log("enter category statement");
        const check = await checkRepo.findOneByOrFail({
            code: updated.referenceCode,
        });
        updated.check = { id: check.id };
        await (0, companyCheck_service_1.updateCheckPaymentStatusNew)(updated.referenceCode, updated.amount, currentUser, manager, false);
        //await transactionRepo.save(updated);
    }
    // 🔄 ORDER
    if (updated.category === "ORDER" && updated.referenceCode) {
        console.log("enter category statement");
        const order = await orderRepo.findOneByOrFail({
            code: updated.referenceCode,
        });
        updated.order = { id: order.id };
        await (0, companyOrder_service_1.updateOrderPaymentStatusNew)(updated.referenceCode, updated.amount, currentUser, manager, false);
        //await transactionRepo.save(updated);
    }
    // 🔄 LOAN
    if (updated.category === "LOAN" && updated.referenceCode) {
        console.log("enter category statement");
        const loanPayment = await loanPaymentRepo.findOneByOrFail({
            code: updated.referenceCode,
        });
        updated.loanPayment = { id: loanPayment.id };
        await (0, companyLoanPayment_service_1.updateLoanPaymentStatusNew)(updated.referenceCode, updated.amount, currentUser, manager, false);
        //await transactionRepo.save(updated); // yeniden kaydet
    }
    // 🔄 BARTER
    if (updated.category === "BARTER" && updated.referenceCode) {
        console.log("enter category statement");
        const barterItem = await barterItemRepo.findOneByOrFail({
            code: updated.referenceCode,
        });
        updated.barterItem = { id: barterItem.id };
        await (0, companyBarterAgreementItem_service_1.updateBarterItemPaymentStatusNew)(updated.referenceCode, updated.amount, currentUser, manager, false);
        //await transactionRepo.save(updated);
    }
    // 🔁 Yeni bakiyeyi uygula
    await (0, companyFinance_service_1.updateCompanyBalanceAfterTransaction)(updated.type, updated.fromAccount?.id ?? null, updated.toAccount?.id ?? null, updated.amount, manager);
    return updated;
};
exports.updateCompanyFinanceTransaction = updateCompanyFinanceTransaction;
