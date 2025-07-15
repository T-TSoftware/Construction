"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportLoanPaymentsPdfHandler = exports.exportLoanPaymentsHandler = exports.getCompanyLoanPaymentByIdHandler = exports.getCompanyLoanPaymentsHandler = exports.patchCompanyLoanPaymentHandler = exports.postCompanyLoanPaymentHandler = void 0;
const data_source_1 = require("../config/data-source");
const companyLoanPayment_service_1 = require("../services/companyLoanPayment.service");
const postCompanyLoanPaymentHandler = async (req, res) => {
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
        const loanId = req.params.loanId;
        const body = req.body;
        if (!loanId || !Array.isArray(body) || body.length === 0) {
            console.log(loanId, " ");
            res.status(400).json({
                errorMessage: "loanCode parametresi ve body array zorunludur.",
            });
            return;
        }
        const results = [];
        for (const item of body) {
            const newPayment = await (0, companyLoanPayment_service_1.createCompanyLoanPayment)({ ...item, loanId }, { userId, companyId }, queryRunner.manager);
            results.push(newPayment);
        }
        await queryRunner.commitTransaction();
        res.status(201).json(results);
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        console.error("❌ POST company loan payments error:", error);
        res.status(500).json({
            errorMessage: error.message || "Loan ödemeleri kaydedilemedi.",
        });
    }
    finally {
        await queryRunner.release();
    }
};
exports.postCompanyLoanPaymentHandler = postCompanyLoanPaymentHandler;
const patchCompanyLoanPaymentHandler = async (req, res) => {
    // 🔒 Yetki kontrolü
    if (req.user?.role !== "superadmin") {
        res.status(403).json({
            errorMessage: "Yalnızca superadmin işlem yapabilir.",
        });
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
        // 📌 Parametreden gelen 'id' kontrolü
        if (!id || typeof id !== "string") {
            throw new Error("Geçerli bir 'id' parametresi gereklidir.");
        }
        // 🔁 Taksit güncelleme işlemi
        await (0, companyLoanPayment_service_1.updateCompanyLoanPayment)(id, body, { userId, companyId }, queryRunner.manager);
        await queryRunner.commitTransaction();
        res.status(200).json({ message: "Taksit başarıyla güncellendi." });
        return;
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        console.error("❌ PATCH loanPayment update error:", error);
        res.status(400).json({
            errorMessage: error.message || "Taksit güncellenemedi.",
        });
        return;
    }
    finally {
        await queryRunner.release();
    }
};
exports.patchCompanyLoanPaymentHandler = patchCompanyLoanPaymentHandler;
const getCompanyLoanPaymentsHandler = async (req, res) => {
    /*if (req.user?.role !== "superadmin") {
      res
        .status(403)
        .json({ errorMessage: "Yalnızca superadmin işlem yapabilir." });
      return;
    }*/
    try {
        const userId = req.user.userId.toString();
        const companyId = req.user.companyId;
        const loanPayments = await (0, companyLoanPayment_service_1.getCompanyLoanPayments)({ userId, companyId }, data_source_1.AppDataSource.manager);
        res.status(200).json({ loanPayments });
    }
    catch (error) {
        console.error("❌ GET loans transactions error:", error);
        res.status(500).json({
            errorMessage: error.message || "Çekler getirilemedi.",
        });
    }
};
exports.getCompanyLoanPaymentsHandler = getCompanyLoanPaymentsHandler;
const getCompanyLoanPaymentByIdHandler = async (req, res) => {
    if (req.user?.role !== "superadmin") {
        res.status(403).json({ error: "Yalnızca superadmin işlem yapabilir." });
        return;
    }
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ error: "loan payment ID zorunludur." });
            return;
        }
        const userId = req.user.userId.toString();
        const companyId = req.user.companyId;
        const loanPayment = await (0, companyLoanPayment_service_1.getCompanyLoanPaymentById)(id, {
            userId,
            companyId,
        });
        res.status(200).json(loanPayment);
    }
    catch (error) {
        console.error("❌ GET loan by ID error:", error);
        res.status(500).json({ error: error.message || "Çek bilgisi alınamadı." });
    }
};
exports.getCompanyLoanPaymentByIdHandler = getCompanyLoanPaymentByIdHandler;
const exportLoanPaymentsHandler = async (req, res) => {
    const userId = req.user.userId.toString();
    const companyId = req.user.companyId;
    const data = await (0, companyLoanPayment_service_1.getCompanyLoanPayments)({ userId, companyId }); // ✅ Doğru parametre tipi
    const csv = await (0, companyLoanPayment_service_1.exportCompanyLoanPaymentsToCsv)(data);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=loan-payments.csv");
    res.send(csv);
};
exports.exportLoanPaymentsHandler = exportLoanPaymentsHandler;
const exportLoanPaymentsPdfHandler = async (req, res) => {
    const userId = req.user.userId.toString();
    const companyId = req.user.companyId;
    const data = await (0, companyLoanPayment_service_1.getCompanyLoanPayments)({ userId, companyId });
    const pdfBuffer = await (0, companyLoanPayment_service_1.exportCompanyLoanPaymentsToPdf)(data);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=loan-payments.pdf");
    res.send(pdfBuffer);
};
exports.exportLoanPaymentsPdfHandler = exportLoanPaymentsPdfHandler;
