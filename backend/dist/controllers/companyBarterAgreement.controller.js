"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompanyBarterAgreementByIdHandler = exports.getAllCompanyBarterAgreementsByProjectIdHandler = exports.getAllCompanyBarterAgreementsHandler = exports.patchCompanyBarterAgreementHandler = exports.postCompanyBarterAgreementFromProjectHandler = exports.postCompanyBarterAgreementHandler = void 0;
const data_source_1 = require("../config/data-source");
const companyBarterAgreement_service_1 = require("../services/companyBarterAgreement.service");
const postCompanyBarterAgreementHandler = async (req, res) => {
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
        const { projectId, counterpartyType, counterpartyId, counterpartyName, agreementDate, status, description, totalOurValue, totalTheirValue,
        //items,
         } = req.body;
        const newAgreement = await (0, companyBarterAgreement_service_1.createCompanyBarterAgreement)({
            projectId,
            counterpartyType,
            counterpartyId,
            counterpartyName,
            agreementDate,
            status,
            description,
            totalOurValue,
            totalTheirValue,
            //items,
        }, { userId, companyId }, queryRunner.manager);
        await queryRunner.commitTransaction();
        res.status(201).json(newAgreement);
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        console.error("❌ POST company barter agreement error:", error);
        res.status(500).json({
            errorMessage: error.message || "Barter kaydı oluşturulamadı.",
        });
    }
    finally {
        await queryRunner.release();
    }
};
exports.postCompanyBarterAgreementHandler = postCompanyBarterAgreementHandler;
const postCompanyBarterAgreementFromProjectHandler = async (req, res) => {
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
        const { projectId } = req.params;
        const { counterpartyType, counterpartyId, counterpartyName, agreementDate, status, description, totalOurValue, totalTheirValue, } = req.body;
        const newAgreement = await (0, companyBarterAgreement_service_1.createCompanyBarterAgreementFromProject)(projectId, {
            counterpartyType,
            counterpartyId,
            counterpartyName,
            agreementDate,
            status,
            description,
            totalOurValue,
            totalTheirValue,
        }, { userId, companyId }, queryRunner.manager);
        await queryRunner.commitTransaction();
        res.status(201).json(newAgreement);
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        console.error("❌ POST company barter agreement error:", error);
        res.status(500).json({
            errorMessage: error.message || "Takas anlaşması oluşturulurken bir hata oluştu.",
        });
    }
    finally {
        await queryRunner.release();
    }
};
exports.postCompanyBarterAgreementFromProjectHandler = postCompanyBarterAgreementFromProjectHandler;
const patchCompanyBarterAgreementHandler = async (req, res) => {
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
        if (!id || typeof id !== "string") {
            throw new Error("Geçerli bir 'id' parametresi gereklidir.");
        }
        const updatedAgreement = await (0, companyBarterAgreement_service_1.updateCompanyBarterAgreement)(id, body, { userId, companyId }, queryRunner.manager);
        await queryRunner.commitTransaction();
        res.status(200).json(updatedAgreement);
        return;
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        console.error("❌ PATCH barter agreement error:", error);
        res.status(400).json({
            errorMessage: error.message || "Takas anlaşması güncellenemedi.",
        });
        return;
    }
    finally {
        await queryRunner.release();
    }
};
exports.patchCompanyBarterAgreementHandler = patchCompanyBarterAgreementHandler;
const getAllCompanyBarterAgreementsHandler = async (req, res) => {
    try {
        const userId = req.user.userId.toString();
        const companyId = req.user.companyId;
        const result = await (0, companyBarterAgreement_service_1.getAllCompanyBarterAgreements)({ userId, companyId });
        res.status(200).json(result);
    }
    catch (error) {
        console.error("❌ GET all company barter agreements error:", error);
        res.status(500).json({
            errorMessage: error.message || "Takas anlaşmaları listesi alınamadı.",
        });
    }
};
exports.getAllCompanyBarterAgreementsHandler = getAllCompanyBarterAgreementsHandler;
const getAllCompanyBarterAgreementsByProjectIdHandler = async (req, res) => {
    try {
        const userId = req.user.userId.toString();
        const companyId = req.user.companyId;
        const projectId = req.params.projectId;
        const result = await (0, companyBarterAgreement_service_1.getAllCompanyBarterAgreementsByProjectId)(projectId, {
            userId,
            companyId,
        });
        res.status(200).json(result);
    }
    catch (error) {
        console.error("❌ GET company barter agreements by project error:", error);
        res.status(500).json({
            errorMessage: error.message || "Proje bazlı takas anlaşmaları alınamadı.",
        });
    }
};
exports.getAllCompanyBarterAgreementsByProjectIdHandler = getAllCompanyBarterAgreementsByProjectIdHandler;
const getCompanyBarterAgreementByIdHandler = async (req, res) => {
    try {
        const userId = req.user.userId.toString();
        const companyId = req.user.companyId;
        const { id } = req.params;
        const result = await (0, companyBarterAgreement_service_1.getCompanyBarterAgreementById)(id, {
            userId,
            companyId,
        });
        res.status(200).json(result);
    }
    catch (error) {
        console.error("❌ GET company barter agreement by ID error:", error);
        res.status(500).json({
            errorMessage: error.message || "Takas anlaşması alınamadı.",
        });
    }
};
exports.getCompanyBarterAgreementByIdHandler = getCompanyBarterAgreementByIdHandler;
