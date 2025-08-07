"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompanyBarterAgreementItemByIdHandler = exports.getCompanyBarterAgreementItemsByAgreementIdHandler = exports.getAllCompanyBarterAgreementItemsHandler = exports.postCompanyBarterAgreementItemHandler = void 0;
const data_source_1 = require("../config/data-source");
const companyBarterAgreementItem_service_1 = require("../services/companyBarterAgreementItem.service");
const postCompanyBarterAgreementItemHandler = async (req, res) => {
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
        const { agreementId } = req.params;
        const { direction, itemType, description, agreedValue, relatedStockCode, relatedSubcontractorCode, relatedSupplierCode, assetDetails, } = req.body;
        const newItem = await (0, companyBarterAgreementItem_service_1.postCompanyBarterAgreementItem)(agreementId, {
            direction,
            itemType,
            description,
            agreedValue,
            relatedStockCode,
            relatedSubcontractorCode,
            relatedSupplierCode,
            assetDetails,
        }, { userId, companyId }, queryRunner.manager);
        await queryRunner.commitTransaction();
        res.status(201).json(newItem);
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        console.error("❌ POST company barter agreement item error:", error);
        res.status(500).json({
            errorMessage: error.message || "Takas kalemi oluşturulamadı.",
        });
    }
    finally {
        await queryRunner.release();
    }
};
exports.postCompanyBarterAgreementItemHandler = postCompanyBarterAgreementItemHandler;
const getAllCompanyBarterAgreementItemsHandler = async (req, res) => {
    try {
        const userId = req.user.userId.toString();
        const companyId = req.user.companyId;
        const items = await (0, companyBarterAgreementItem_service_1.getAllCompanyBarterAgreementItems)({ userId, companyId }, data_source_1.AppDataSource.manager);
        res.status(200).json(items);
    }
    catch (error) {
        console.error("❌ GET all agreement items error:", error);
        res.status(500).json({
            errorMessage: error.message || "Takas kalemleri alınamadı.",
        });
    }
};
exports.getAllCompanyBarterAgreementItemsHandler = getAllCompanyBarterAgreementItemsHandler;
const getCompanyBarterAgreementItemsByAgreementIdHandler = async (req, res) => {
    try {
        const userId = req.user.userId.toString();
        const companyId = req.user.companyId;
        const { barterId } = req.params;
        const items = await (0, companyBarterAgreementItem_service_1.getCompanyBarterAgreementItemsByAgreementId)(barterId, { userId, companyId }, data_source_1.AppDataSource.manager);
        res.status(200).json(items);
    }
    catch (error) {
        console.error("❌ GET agreement items by agreementId error:", error);
        res.status(500).json({
            errorMessage: error.message || "Takas anlaşmasına ait kalemler alınamadı.",
        });
    }
};
exports.getCompanyBarterAgreementItemsByAgreementIdHandler = getCompanyBarterAgreementItemsByAgreementIdHandler;
const getCompanyBarterAgreementItemByIdHandler = async (req, res) => {
    try {
        const userId = req.user.userId.toString();
        const companyId = req.user.companyId;
        const { itemId } = req.params;
        const item = await (0, companyBarterAgreementItem_service_1.getCompanyBarterAgreementItemById)(itemId, { userId, companyId }, data_source_1.AppDataSource.manager);
        res.status(200).json(item);
    }
    catch (error) {
        console.error("❌ GET agreement item by ID error:", error);
        res.status(500).json({
            errorMessage: error.message || "Takas kalemi bulunamadı.",
        });
    }
};
exports.getCompanyBarterAgreementItemByIdHandler = getCompanyBarterAgreementItemByIdHandler;
