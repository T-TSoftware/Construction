"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompanyLoanByIdHandler = exports.getCompanyLoansHandler = exports.postCompanyLoanHandler = void 0;
const data_source_1 = require("../config/data-source");
const companyLoan_service_1 = require("../services/companyLoan.service");
const postCompanyLoanHandler = async (req, res) => {
    // 🔐 Yalnızca superadmin işlem yapabilir
    if (req.user?.role !== "superadmin") {
        res
            .status(403)
            .json({ errorMessage: "Yalnızca superadmin işlemi yapabilir." });
        return;
    }
    const queryRunner = data_source_1.AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const userId = req.user.userId.toString();
        const companyId = req.user.companyId;
        const { code, name, accountNo, bankCode, projectCode, totalAmount, remainingPrincipal, remainingInstallmentAmount, currency, interestRate, totalInstallmentCount, remainingInstallmentCount, loanDate, purpose, loanType, status, description, } = req.body;
        const newLoan = await (0, companyLoan_service_1.createCompanyLoan)({
            code,
            name,
            accountNo,
            bankCode,
            projectCode,
            totalAmount,
            remainingPrincipal,
            remainingInstallmentAmount,
            currency,
            interestRate,
            totalInstallmentCount,
            remainingInstallmentCount,
            loanDate,
            purpose,
            loanType,
            status,
            description,
        }, { userId, companyId }, queryRunner.manager);
        await queryRunner.commitTransaction();
        res.status(201).json(newLoan);
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        console.error("❌ POST company loan error:", error);
        res.status(500).json({
            errorMessage: error.message || "Kredi kaydı oluşturulamadı.",
        });
    }
    finally {
        await queryRunner.release();
    }
};
exports.postCompanyLoanHandler = postCompanyLoanHandler;
const getCompanyLoansHandler = async (req, res) => {
    /*if (req.user?.role !== "superadmin") {
      res
        .status(403)
        .json({ errorMessage: "Yalnızca superadmin işlem yapabilir." });
      return;
    }*/
    try {
        const userId = req.user.userId.toString();
        const companyId = req.user.companyId;
        const loans = await (0, companyLoan_service_1.getCompanyLoans)({ userId, companyId }, data_source_1.AppDataSource.manager);
        res.status(200).json({ loans });
    }
    catch (error) {
        console.error("❌ GET loans transactions error:", error);
        res.status(500).json({
            errorMessage: error.message || "Çekler getirilemedi.",
        });
    }
};
exports.getCompanyLoansHandler = getCompanyLoansHandler;
const getCompanyLoanByIdHandler = async (req, res) => {
    if (req.user?.role !== "superadmin") {
        res.status(403).json({ error: "Yalnızca superadmin işlem yapabilir." });
        return;
    }
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ error: "loan ID zorunludur." });
            return;
        }
        const userId = req.user.userId.toString();
        const companyId = req.user.companyId;
        const loan = await (0, companyLoan_service_1.getCompanyLoanById)(id, { userId, companyId });
        res.status(200).json(loan);
    }
    catch (error) {
        console.error("❌ GET loan by ID error:", error);
        res.status(500).json({ error: error.message || "Çek bilgisi alınamadı." });
    }
};
exports.getCompanyLoanByIdHandler = getCompanyLoanByIdHandler;
