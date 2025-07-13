"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCompanyFinanceTransactionById = exports.createLoanTransactionFromPaymentData = exports.getCompanyFinanceTransactionById = exports.getCompanyFinanceTransactions = exports.updateCompanyBalanceAfterTransaction = exports.updateCompanyFinanceTransaction = exports.createCompanyFinanceTransaction = void 0;
const CompanyFinance_1 = require("../entities/CompanyFinance");
const CompanyBalance_1 = require("../entities/CompanyBalance");
const CompanyProject_1 = require("../entities/CompanyProject");
const data_source_1 = require("../config/data-source");
// Eğer ayrı bir dosyada tutuyorsan import edebilirsin
const generateCode_1 = require("../utils/generateCode");
const CompanyOrder_1 = require("../entities/CompanyOrder");
const companyOrder_service_1 = require("./companyOrder.service");
const transactionRepo = data_source_1.AppDataSource.getRepository(CompanyFinance_1.CompanyFinanceTransaction);
const balanceRepo = data_source_1.AppDataSource.getRepository(CompanyBalance_1.CompanyBalance);
const projectRepo = data_source_1.AppDataSource.getRepository(CompanyProject_1.CompanyProject);
const createCompanyFinanceTransaction = async (data, currentUser, manager = data_source_1.AppDataSource.manager) => {
    const transactionRepo = manager.getRepository(CompanyFinance_1.CompanyFinanceTransaction);
    const balanceRepo = manager.getRepository(CompanyBalance_1.CompanyBalance);
    const projectRepo = manager.getRepository(CompanyProject_1.CompanyProject);
    const orderRepo = manager.getRepository(CompanyOrder_1.CompanyOrder);
    const fromAccount = await balanceRepo.findOneByOrFail({
        code: data.fromAccountCode,
    });
    const order = data.orderCode
        ? await orderRepo.findOneByOrFail({ code: data.orderCode })
        : null;
    const project = data.projectCode
        ? await projectRepo.findOneByOrFail({ id: data.projectCode })
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
        await (0, exports.updateCompanyBalanceAfterTransaction)("TRANSFER", fromAccount.id, toAccount.id, data.amount, manager);
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
        order: order ? { id: order.id } : null,
        createdBy: { id: currentUser.userId },
        updatedBy: { id: currentUser.userId },
    });
    const saved = await transactionRepo.save(transaction);
    if (data.orderCode) {
        await (0, companyOrder_service_1.updateOrderPaymentStatus)(data.orderCode, data.amount, currentUser, manager);
    }
    await (0, exports.updateCompanyBalanceAfterTransaction)(data.type, fromAccount.id, null, data.amount, manager);
    return saved;
};
exports.createCompanyFinanceTransaction = createCompanyFinanceTransaction;
const updateCompanyFinanceTransaction = async (code, data, currentUser, manager = data_source_1.AppDataSource.manager) => {
    const transactionRepo = manager.getRepository(CompanyFinance_1.CompanyFinanceTransaction);
    const balanceRepo = manager.getRepository(CompanyBalance_1.CompanyBalance);
    const projectRepo = manager.getRepository(CompanyProject_1.CompanyProject);
    const orderRepo = manager.getRepository(CompanyOrder_1.CompanyOrder);
    const existing = await transactionRepo.findOne({
        where: { code, company: { id: currentUser.companyId } },
        relations: ["fromAccount", "toAccount", "company", "project", "order"],
    });
    console.log(existing);
    if (!existing) {
        throw new Error("Finansal işlem bulunamadı.");
    }
    // 🔁 Eski işlemi geri al
    await (0, exports.updateCompanyBalanceAfterTransaction)(existing.type, existing.fromAccount?.id ?? null, existing.toAccount?.id ?? null, existing.amount, manager, true);
    // 🧾 Gerekli ilişkileri getir
    const newFromAccount = data.fromAccountCode && data.fromAccountCode !== existing.fromAccount?.code
        ? await balanceRepo.findOneByOrFail({ code: data.fromAccountCode })
        : existing.fromAccount;
    const newToAccount = data.toAccountCode && data.toAccountCode !== existing.toAccount?.code
        ? await balanceRepo.findOneByOrFail({ code: data.toAccountCode })
        : existing.toAccount;
    const newOrder = data.orderCode && data.orderCode !== existing.order?.code
        ? await orderRepo.findOneByOrFail({ id: data.orderCode })
        : existing.order;
    const newProject = data.projectCode && data.projectCode !== existing.project?.id
        ? await projectRepo.findOneByOrFail({ id: data.projectCode })
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
    existing.checkCode = data.checkCode ?? existing.checkCode;
    existing.description = data.description ?? existing.description;
    //existing.order = newOrder;
    existing.project = newProject;
    existing.updatedBy = { id: currentUser.userId };
    existing.updatedatetime = new Date();
    console.log("existing amount 1: ", existing.amount);
    // 💾 Güncelle
    const updated = await transactionRepo.save(existing);
    console.log("ordercode :", existing.order?.code, " data.amount: ", data.amount, " existing amount: ", existing.amount);
    if (existing.order?.code &&
        data.amount !== undefined &&
        Number(data.amount) !== Number(previousAmount)) {
        const diff = Number(data.amount) - Number(previousAmount);
        await (0, companyOrder_service_1.updateOrderPaymentStatus)(existing.order.code, diff, currentUser, manager);
    }
    // 🔁 Yeni işlemin etkisini uygula
    await (0, exports.updateCompanyBalanceAfterTransaction)(updated.type, updated.fromAccount?.id ?? null, updated.toAccount?.id ?? null, updated.amount, manager);
    return updated;
};
exports.updateCompanyFinanceTransaction = updateCompanyFinanceTransaction;
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
const updateCompanyBalanceAfterTransaction = async (type, fromAccountId, toAccountId, amount, manager, isReverse = false // default olarak false, yani normal işlem yapılır
) => {
    const repo = manager.getRepository(CompanyBalance_1.CompanyBalance);
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
        console.log(`${isReverse ? "REVERSE" : "APPLY"} COLLECTION: ${reverseSign * amount}`);
    }
    // 🔁 Transfer (TRANSFER): Bir hesaptan düşülür, diğerine eklenir
    if (type === "TRANSFER") {
        if (fromAccountId) {
            await repo.increment({ id: fromAccountId }, "amount", sign * amount);
            console.log(`${isReverse ? "REVERSE" : "APPLY"} TRANSFER FROM: ${sign * amount}`);
        }
        if (toAccountId) {
            await repo.increment({ id: toAccountId }, "amount", -sign * amount);
            console.log(`${isReverse ? "REVERSE" : "APPLY"} TRANSFER TO: ${-sign * amount}`);
        }
    }
};
exports.updateCompanyBalanceAfterTransaction = updateCompanyBalanceAfterTransaction;
const getCompanyFinanceTransactions = async (currentUser, manager = data_source_1.AppDataSource.manager) => {
    const repo = manager.getRepository(CompanyFinance_1.CompanyFinanceTransaction);
    const transactions = await repo.find({
        where: {
            company: { id: currentUser.companyId },
        },
        relations: ["fromAccount", "toAccount", "project", "updatedBy", "order"],
        order: { transactionDate: "DESC" },
    });
    return transactions;
};
exports.getCompanyFinanceTransactions = getCompanyFinanceTransactions;
const getCompanyFinanceTransactionById = async (id, currentUser, manager = data_source_1.AppDataSource.manager) => {
    const repo = manager.getRepository(CompanyFinance_1.CompanyFinanceTransaction);
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
exports.getCompanyFinanceTransactionById = getCompanyFinanceTransactionById;
const createLoanTransactionFromPaymentData = async (payment, currentUser, manager = data_source_1.AppDataSource.manager) => {
    const repo = manager.getRepository(CompanyFinance_1.CompanyFinanceTransaction);
    const code = await (0, generateCode_1.generateFinanceTransactionCode)("PAYMENT", payment.transactionDate, manager);
    const transaction = repo.create({
        type: "PAYMENT",
        code,
        amount: payment.amount,
        currency: "TRY", // varsayılan
        fromAccount: { id: payment.bankId },
        targetName: payment.loanName,
        transactionDate: payment.transactionDate,
        method: "BANK",
        category: "Kredi Ödeme",
        source: `${payment.paymentCode} Ödemesi`,
        invoiceYN: "Y",
        loanCode: payment.paymentCode,
        description: payment.description,
        company: { id: currentUser.companyId },
        project: payment.projectId ? { id: payment.projectId } : null,
        createdBy: { id: currentUser.userId },
        updatedBy: { id: currentUser.userId },
    });
    const saved = await repo.save(transaction);
    await (0, exports.updateCompanyBalanceAfterTransaction)("PAYMENT", payment.bankId, null, payment.amount, manager);
    return saved;
};
exports.createLoanTransactionFromPaymentData = createLoanTransactionFromPaymentData;
const deleteCompanyFinanceTransactionById = async (id, currentUser, manager) => {
    const transactionRepo = manager.getRepository(CompanyFinance_1.CompanyFinanceTransaction);
    const transaction = await transactionRepo.findOneOrFail({
        where: { id },
        relations: ["company"],
    });
    if (transaction.company.id !== currentUser.companyId) {
        throw new Error("Bu finansal işlem kaydına erişim yetkiniz yok.");
    }
    await (0, exports.updateCompanyBalanceAfterTransaction)(transaction.type, transaction.fromAccount?.id ?? null, transaction.toAccount?.id ?? null, transaction.amount, manager, true);
    await transactionRepo.delete({ id: transaction.id });
};
exports.deleteCompanyFinanceTransactionById = deleteCompanyFinanceTransactionById;
