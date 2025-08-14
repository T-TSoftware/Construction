"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompanyCheckByIdHandler = exports.getCompanyChecksHandler = exports.patchCompanyCheckHandler = exports.postCompanyCheckHandler = void 0;
const data_source_1 = require("../config/data-source");
const companyCheck_service_1 = require("../services/companyCheck.service");
const postCompanyCheckHandler = async (req, res) => {
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
        const { checkNo, checkDate, 
        //transactionDate,
        firm, amount, bankId, type, projectId, description, status, dueDate, } = req.body;
        const newCheck = await (0, companyCheck_service_1.createCompanyCheck)({
            checkNo,
            checkDate,
            //transactionDate,
            firm,
            amount,
            bankId,
            type,
            projectId,
            description,
            status,
            dueDate,
        }, { userId, companyId }, queryRunner.manager);
        await queryRunner.commitTransaction();
        res.status(201).json(newCheck);
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        console.error("❌ POST company check error:", error);
        res.status(500).json({
            errorMessage: error.message || "Çek kaydı oluşturulamadı.",
        });
    }
    finally {
        await queryRunner.release();
    }
};
exports.postCompanyCheckHandler = postCompanyCheckHandler;
const patchCompanyCheckHandler = async (req, res) => {
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
        // 🔁 Check güncelleme işlemi
        const updatedCheck = await (0, companyCheck_service_1.updateCompanyCheck)(id, body, { userId, companyId }, queryRunner.manager);
        await queryRunner.commitTransaction();
        res.status(200).json(updatedCheck);
        return;
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        console.error("❌ PATCH check update error:", error);
        res.status(400).json({
            errorMessage: error.message || "Çek güncellenemedi.",
        });
        return;
    }
    finally {
        await queryRunner.release();
    }
};
exports.patchCompanyCheckHandler = patchCompanyCheckHandler;
const getCompanyChecksHandler = async (req, res) => {
    /*if (req.user?.role !== "superadmin") {
      res
        .status(403)
        .json({ errorMessage: "Yalnızca superadmin işlem yapabilir." });
      return;
    }*/
    try {
        const userId = req.user.userId.toString();
        const companyId = req.user.companyId;
        const checks = await (0, companyCheck_service_1.getCompanyChecks)({ userId, companyId }, data_source_1.AppDataSource.manager);
        res.status(200).json({ checks });
    }
    catch (error) {
        console.error("❌ GET checks transactions error:", error);
        res.status(500).json({
            errorMessage: error.message || "Çekler getirilemedi.",
        });
    }
};
exports.getCompanyChecksHandler = getCompanyChecksHandler;
const getCompanyCheckByIdHandler = async (req, res) => {
    if (req.user?.role !== "superadmin") {
        res.status(403).json({ error: "Yalnızca superadmin işlem yapabilir." });
        return;
    }
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ error: "Check ID zorunludur." });
            return;
        }
        const userId = req.user.userId.toString();
        const companyId = req.user.companyId;
        const check = await (0, companyCheck_service_1.getCompanyCheckById)(id, { userId, companyId });
        res.status(200).json(check);
    }
    catch (error) {
        console.error("❌ GET check by ID error:", error);
        res.status(500).json({ error: error.message || "Çek bilgisi alınamadı." });
    }
};
exports.getCompanyCheckByIdHandler = getCompanyCheckByIdHandler;
