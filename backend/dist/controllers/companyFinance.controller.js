"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postCompanyFinanceTransactionHandler = void 0;
const data_source_1 = require("../config/data-source");
const companyFinance_service_1 = require("../services/companyFinance.service");
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
        const results = [];
        for (const body of req.body) {
            const { type, amount, currency, fromAccountCode, toAccountCode, targetType, targetId, targetName, transactionDate, method, category, invoiceYN, invoiceCode, checkCode, description, projectId, source, } = body;
            const transaction = await (0, companyFinance_service_1.createCompanyFinanceTransaction)({
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
                checkCode,
                description,
                projectId,
                source,
            }, { userId, companyId }, queryRunner.manager);
            results.push(transaction);
        }
        await queryRunner.commitTransaction();
        res.status(201).json({ transactions: results });
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
