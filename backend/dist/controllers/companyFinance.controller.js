"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCompanyFinanceTransactionByIdHandler = exports.getCompanyFinanceTransactionByIdHandler = exports.getCompanyFinanceTransactionsHandler = exports.patchCompanyFinanceTransactionHandler = exports.postCompanyFinanceTransactionHandler = void 0;
const data_source_1 = require("../config/data-source");
const companyFinance_service_1 = require("../services/companyFinance.service");
const companyFinanceTransaction_service_1 = require("../services/companyFinanceTransaction.service");
const postCompanyFinanceTransactionHandler = async (req, res) => {
    if (req.user?.role !== "superadmin") {
        res
            .status(403)
            .json({ errorMessage: "Yalnızca superadmin işlem yapabilir." });
        return;
    }
    const queryRunner = data_source_1.AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const userId = req.user.userId.toString();
        const companyId = req.user.companyId;
        const { type, amount, currency, fromAccountCode, toAccountCode, targetType, targetId, targetName, transactionDate, method, category, invoiceYN, invoiceCode, referenceCode, description, projectId, source, } = req.body;
        const transaction = await (0, companyFinanceTransaction_service_1.createCompanyFinanceTransaction)({
            type,
            amount,
            currency,
            fromAccountCode,
            toAccountCode,
            targetType,
            targetId,
            targetName,
            transactionDate,
            method,
            category,
            invoiceYN,
            invoiceCode,
            referenceCode,
            description,
            projectId,
            source,
        }, { userId, companyId }, queryRunner.manager);
        await queryRunner.commitTransaction();
        res.status(201).json({ transaction });
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        console.error("❌ POST company finance transaction error:", error);
        res.status(500).json({
            errorMessage: error.message || "Finansal işlem(ler) oluşturulamadı.",
        });
    }
    finally {
        await queryRunner.release();
    }
};
exports.postCompanyFinanceTransactionHandler = postCompanyFinanceTransactionHandler;
const patchCompanyFinanceTransactionHandler = async (req, res) => {
    if (req.user?.role !== "superadmin") {
        res
            .status(403)
            .json({ errorMessage: "Yalnızca superadmin işlem yapabilir." });
        return;
    }
    const queryRunner = data_source_1.AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const userId = req.user.userId.toString();
        const companyId = req.user.companyId;
        const id = req.params.id;
        const body = req.body;
        console.log(req.body);
        if (!id || typeof id !== "string") {
            throw new Error("Geçerli bir 'code' parametresi gereklidir.");
        }
        const updatedTransaction = await (0, companyFinanceTransaction_service_1.updateCompanyFinanceTransactionNew)(id, body, { userId, companyId }, queryRunner.manager);
        await queryRunner.commitTransaction();
        res.status(200).json(updatedTransaction);
        return;
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        console.error("❌ PATCH finance transaction error:", error);
        res.status(400).json({
            errorMessage: error.message || "Finansal işlem güncellenemedi.",
        });
        return;
    }
    finally {
        await queryRunner.release();
    }
};
exports.patchCompanyFinanceTransactionHandler = patchCompanyFinanceTransactionHandler;
const getCompanyFinanceTransactionsHandler = async (req, res) => {
    /*if (req.user?.role !== "superadmin") {
      res
        .status(403)
        .json({ errorMessage: "Yalnızca superadmin işlem yapabilir." });
      return;
    }*/
    try {
        const userId = req.user.userId.toString();
        const companyId = req.user.companyId;
        const transactions = await (0, companyFinance_service_1.getCompanyFinanceTransactions)({ userId, companyId }, data_source_1.AppDataSource.manager);
        res.status(200).json({ transactions });
    }
    catch (error) {
        console.error("❌ GET finance transactions error:", error);
        res.status(500).json({
            errorMessage: error.message || "Finansal işlemler getirilemedi.",
        });
    }
};
exports.getCompanyFinanceTransactionsHandler = getCompanyFinanceTransactionsHandler;
const getCompanyFinanceTransactionByIdHandler = async (req, res) => {
    if (req.user?.role !== "superadmin") {
        res.status(403).json({ error: "Yalnızca superadmin işlem yapabilir." });
        return;
    }
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ error: "Transaction ID zorunludur." });
            return;
        }
        const userId = req.user.userId.toString();
        const companyId = req.user.companyId;
        const transaction = await (0, companyFinance_service_1.getCompanyFinanceTransactionById)(id, {
            userId,
            companyId,
        });
        res.status(200).json(transaction);
    }
    catch (error) {
        console.error("❌ GET finance transaction by ID error:", error);
        res.status(500).json({
            error: error.message || "Finansal işlem bilgisi alınamadı.",
        });
    }
};
exports.getCompanyFinanceTransactionByIdHandler = getCompanyFinanceTransactionByIdHandler;
// 📌 Silme – Sadece superadmin
const deleteCompanyFinanceTransactionByIdHandler = async (req, res) => {
    if (req.user?.role !== "superadmin") {
        res.status(403).json({ errorMessage: "Yalnızca superadmin işlem yapabilir." });
        return;
    }
    const qr = data_source_1.AppDataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
        const { id } = req.params;
        if (!id || typeof id !== "string") {
            throw new Error("Geçerli bir 'id' parametresi gereklidir.");
        }
        const userId = req.user.userId.toString();
        const companyId = req.user.companyId;
        await (0, companyFinance_service_1.deleteCompanyFinanceTransactionById)(id, { userId, companyId }, qr.manager);
        await qr.commitTransaction(); // ✅ kalıcılaştır
        res.status(204).send(); // ✅ DELETE için ideal yanıt
    }
    catch (error) {
        await qr.rollbackTransaction(); // 🔙 geri al
        console.error("❌ DELETE finance transaction error:", error);
        res.status(400).json({
            errorMessage: error.message || "Finansal işlem silinemedi.",
        });
    }
    finally {
        await qr.release(); // 🧹 bağlantıyı bırak
    }
};
exports.deleteCompanyFinanceTransactionByIdHandler = deleteCompanyFinanceTransactionByIdHandler;
