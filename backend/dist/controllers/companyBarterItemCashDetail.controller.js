"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompanyBarterCashDetailsByItemIdHandler = exports.patchCompanyBarterCashDetailsHandler = exports.postCompanyBarterCashDetailsHandler = void 0;
const data_source_1 = require("../config/data-source");
const companyBarterItemCashDetail_service_1 = require("../services/companyBarterItemCashDetail.service");
const postCompanyBarterCashDetailsHandler = async (req, res) => {
    if (req.user?.role !== "superadmin") {
        res.status(403).json({
            errorMessage: "Yalnızca superadmin işlemi yapabilir.",
        });
        return;
    }
    const queryRunner = data_source_1.AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const userId = req.user.userId.toString();
        const companyId = req.user.companyId;
        const barterItemId = req.params.barterItemId;
        const results = [];
        for (const body of req.body) {
            const data = {
                barterItemId,
                amount: body.amount,
                currency: body.currency,
                fromAccountId: body.fromAccountId,
                accountType: body.accountType,
                status: body.status,
                description: body.description,
            };
            const cashDetail = await (0, companyBarterItemCashDetail_service_1.createCompanyBarterCashDetail)(data, { userId, companyId }, queryRunner.manager);
            results.push(cashDetail);
        }
        await queryRunner.commitTransaction();
        res.status(201).json(results);
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        console.error("❌ POST barter cash details error:", error);
        res.status(500).json({
            errorMessage: error.message || "Cash detail kayıtları oluşturulamadı.",
        });
    }
    finally {
        await queryRunner.release();
    }
};
exports.postCompanyBarterCashDetailsHandler = postCompanyBarterCashDetailsHandler;
const patchCompanyBarterCashDetailsHandler = async (req, res) => {
    if (req.user?.role !== "superadmin") {
        res.status(403).json({
            errorMessage: "Yalnızca superadmin işlemi yapabilir.",
        });
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
            const data = {
                amount: body.amount,
                currency: body.currency,
                fromAccountId: body.fromAccountId,
                accountType: body.accountType,
                status: body.status,
                paymentDate: body.paymentDate,
                description: body.description,
            };
            const updatedCashDetail = await (0, companyBarterItemCashDetail_service_1.updateCompanyBarterCashDetail)(body.id, // 🔧 doğru parametre bu
            data, { userId, companyId }, queryRunner.manager);
            results.push(updatedCashDetail);
        }
        await queryRunner.commitTransaction();
        res.status(200).json(results);
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        console.error("❌ PATCH barter cash details error:", error);
        res.status(500).json({
            errorMessage: error.message || "Cash detail kayıtları güncellenemedi.",
        });
    }
    finally {
        await queryRunner.release();
    }
};
exports.patchCompanyBarterCashDetailsHandler = patchCompanyBarterCashDetailsHandler;
const getCompanyBarterCashDetailsByItemIdHandler = async (req, res) => {
    try {
        // Kullanıcı bilgilerini al
        const userId = req.user.userId.toString();
        const companyId = req.user.companyId;
        const barterItemId = req.params.barterItemId;
        // Cash Detail'leri getir
        const details = await (0, companyBarterItemCashDetail_service_1.getCompanyBarterCashDetailsByItemId)(barterItemId, {
            userId,
            companyId,
        });
        res.status(200).json(details);
    }
    catch (error) {
        console.error("❌ GET barter cash details error:", error);
        res.status(500).json({
            errorMessage: error.message || "Cash detail kayıtları alınamadı.",
        });
    }
};
exports.getCompanyBarterCashDetailsByItemIdHandler = getCompanyBarterCashDetailsByItemIdHandler;
