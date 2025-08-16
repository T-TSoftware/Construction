"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectStocksByProjectIdHandler = exports.getCompanyStockByIdHandler = exports.getCompanyStocksHandler = exports.patchCompanyStockHandler = exports.postCompanyStockHandler = void 0;
const data_source_1 = require("../config/data-source");
const companyStock_service_1 = require("../services/companyStock.service");
const postCompanyStockHandler = async (req, res) => {
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
        const { projectId, name, category, description, unit, quantity, minimumQuantity, location, stockDate, } = req.body;
        const newStock = await (0, companyStock_service_1.createCompanyStock)({
            projectId,
            name,
            category,
            description,
            unit,
            quantity,
            minimumQuantity,
            location,
            stockDate,
        }, { userId, companyId }, queryRunner.manager);
        await queryRunner.commitTransaction();
        res.status(201).json(newStock);
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        console.error("❌ POST company stock error:", error);
        res.status(500).json({
            errorMessage: error.message || "Stok kaydı oluşturulamadı.",
        });
    }
    finally {
        await queryRunner.release();
    }
};
exports.postCompanyStockHandler = postCompanyStockHandler;
const patchCompanyStockHandler = async (req, res) => {
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
        const updatedStock = await (0, companyStock_service_1.updateCompanyStock)(id, req.body, {
            userId,
            companyId,
        }, queryRunner.manager);
        await queryRunner.commitTransaction();
        res.status(200).json(updatedStock);
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        console.error("❌ PATCH company stock error:", error);
        res
            .status(400)
            .json({ errorMessage: error.message || "Stok güncellenemedi." });
    }
    finally {
        await queryRunner.release();
    }
};
exports.patchCompanyStockHandler = patchCompanyStockHandler;
const getCompanyStocksHandler = async (req, res) => {
    try {
        const companyId = req.user.companyId;
        const stocks = await (0, companyStock_service_1.getCompanyStocks)(companyId);
        res.status(200).json(stocks);
    }
    catch (error) {
        console.error("❌ GET company stocks error:", error);
        res.status(500).json({ errorMessage: "Stok listesi alınamadı." });
    }
};
exports.getCompanyStocksHandler = getCompanyStocksHandler;
const getCompanyStockByIdHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId.toString();
        const companyId = req.user.companyId;
        const stock = await (0, companyStock_service_1.getCompanyStockById)(id, { userId, companyId });
        res.status(200).json(stock);
    }
    catch (error) {
        console.error("❌ GET project suppliers error:", error);
        res.status(500).json({ error: "Tedarikçiler alınamadı." });
        return;
    }
};
exports.getCompanyStockByIdHandler = getCompanyStockByIdHandler;
const getProjectStocksByProjectIdHandler = async (req, res) => {
    try {
        const userId = req.user.userId.toString();
        const companyId = req.user.companyId;
        const projectId = req.params.projectId;
        if (!projectId) {
            res.status(400).json({ errorMessage: "Loan ID zorunludur." });
            return;
        }
        const projectStocks = await (0, companyStock_service_1.getProjectStockByProjectId)(projectId, { userId, companyId }, data_source_1.AppDataSource.manager);
        res.status(200).json({ projectStocks });
    }
    catch (error) {
        console.error("❌ GET Project Stocks by projectId error:", error);
        res.status(500).json({
            errorMessage: error.message || "Proje Stokları getirilemedi.",
        });
    }
};
exports.getProjectStocksByProjectIdHandler = getProjectStocksByProjectIdHandler;
