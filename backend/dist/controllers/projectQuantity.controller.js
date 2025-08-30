"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectQuantitiesHandler = exports.postProjectQuantityHandler = void 0;
const projectQuantity_service_1 = require("../services/projectQuantity.service");
const data_source_1 = require("../config/data-source");
const postProjectQuantityHandler = async (req, res) => {
    if (req.user?.role !== "superadmin") {
        res.status(403).json({ error: "Yalnızca superadmin işlem yapabilir." });
        return;
    }
    const queryRunner = data_source_1.AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const { projectId } = req.params;
        const { quantityItemCode, quantity, unit, description, category } = req.body;
        if (!quantity || !unit) {
            res.status(400).json({ error: "Gerekli alanlar eksik." });
            return;
        }
        const userId = req.user.userId.toString();
        const companyId = req.user.companyId;
        const newRecord = await (0, projectQuantity_service_1.createProjectQuantity)(projectId, {
            quantityItemCode,
            quantity,
            unit,
            description,
            category,
        }, { userId, companyId }, queryRunner.manager);
        await queryRunner.commitTransaction();
        res.status(201).json({ newRecord });
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        console.error("❌ POST project quantity error:", error);
        res.status(500).json({
            errorMessage: error.message || "Metraj kaydı oluşturulamadı.",
        });
    }
    finally {
        await queryRunner.release();
    }
};
exports.postProjectQuantityHandler = postProjectQuantityHandler;
const getProjectQuantitiesHandler = async (req, res) => {
    try {
        const { projectId } = req.params;
        const userId = req.user.userId.toString();
        const companyId = req.user.companyId;
        if (!projectId) {
            res.status(400).json({ error: "projectId parametresi zorunludur." });
            return;
        }
        const result = await (0, projectQuantity_service_1.getProjectQuantities)(projectId, { userId, companyId });
        res.status(200).json(result);
    }
    catch (error) {
        console.error("❌ GET project quantities error:", error);
        res.status(500).json({ error: "Metrajlar alınamadı." });
        return;
    }
};
exports.getProjectQuantitiesHandler = getProjectQuantitiesHandler;
