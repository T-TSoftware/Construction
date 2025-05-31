"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCompanyFinanceTransaction = void 0;
const CompanyFinance_1 = require("../entities/CompanyFinance");
const CompanyBalance_1 = require("../entities/CompanyBalance");
const CompanyProject_1 = require("../entities/CompanyProject");
const data_source_1 = require("../config/data-source");
// Eğer ayrı bir dosyada tutuyorsan import edebilirsin
const generateCode_1 = require("../utils/generateCode");
const transactionRepo = data_source_1.AppDataSource.getRepository(CompanyFinance_1.CompanyFinanceTransaction);
const balanceRepo = data_source_1.AppDataSource.getRepository(CompanyBalance_1.CompanyBalance);
const projectRepo = data_source_1.AppDataSource.getRepository(CompanyProject_1.CompanyProject);
const createCompanyFinanceTransaction = async (data, currentUser, manager = data_source_1.AppDataSource.manager) => {
    const transactionRepo = manager.getRepository(CompanyFinance_1.CompanyFinanceTransaction);
    const balanceRepo = manager.getRepository(CompanyBalance_1.CompanyBalance);
    const projectRepo = manager.getRepository(CompanyProject_1.CompanyProject);
    const fromAccount = await balanceRepo.findOneByOrFail({
        code: data.fromAccountCode,
    });
    const project = data.projectId
        ? await projectRepo.findOneByOrFail({ id: data.projectId })
        : null;
    const results = [];
    // TRANSFER işlemiyse çift kayıt oluştur
    if (data.type === "TRANSFER") {
        if (!data.toAccountCode) {
            throw new Error("Transfer için toAccountCode zorunludur.");
        }
        const toAccount = await balanceRepo.findOneByOrFail({
            code: data.toAccountCode,
        });
        // OUT → fromAccount
        const outCode = await (0, generateCode_1.generateFinanceTransactionCode)("TRANSFER", data.transactionDate, manager, "OUT");
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
        const inCode = await (0, generateCode_1.generateFinanceTransactionCode)("TRANSFER", data.transactionDate, manager, "IN");
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
        await updateCompanyBalance("TRANSFER", fromAccount.id, toAccount.id, data.amount);
        return results;
    }
    // PAYMENT / COLLECTION işlemi için tek kayıt
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
exports.createCompanyFinanceTransaction = createCompanyFinanceTransaction;
const updateCompanyBalance = async (type, fromAccountId, toAccountId, amount) => {
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
