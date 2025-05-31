"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompanyStocksHandler = exports.patchCompanyStocksHandler = exports.patchCompanyStockHandler = exports.postCompanyStockHandler = void 0;
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
        const results = [];
        for (const body of req.body) {
            const { projectId, 
            //stockItemId, // ✅ stockItemId artık zorunlu
            //code,
            name, category, description, unit, quantity, minimumQuantity, location, stockDate, } = body;
            const newStock = await (0, companyStock_service_1.createCompanyStock)({
                projectId,
                //stockItemId, // ✅ stockItemId artık zorunlu
                //code,
                name,
                category,
                description,
                unit,
                quantity,
                minimumQuantity,
                location,
                stockDate,
            }, { userId, companyId }, queryRunner.manager);
            results.push(newStock);
        }
        await queryRunner.commitTransaction();
        res.status(201).json(results);
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        console.error("❌ POST company stock error:", error);
        res.status(500).json({
            errorMessage: error.message || "Stok kayıtları oluşturulamadı.",
        });
        return;
    }
    finally {
        await queryRunner.release();
    }
};
exports.postCompanyStockHandler = postCompanyStockHandler;
const patchCompanyStockHandler = async (req, res) => {
    // ✅ Sadece superadmin güncelleme yapabilir
    if (req.user?.role !== "superadmin") {
        res
            .status(403)
            .json({ errorMessage: "Yalnızca superadmin işlemi yapabilir." });
        return;
    }
    try {
        const { code } = req.params;
        const userId = req.user.userId.toString();
        const companyId = req.user.companyId;
        const updatedStock = await (0, companyStock_service_1.updateCompanyStock)(code, req.body, {
            userId,
            companyId,
        });
        res.status(200).json(updatedStock);
    }
    catch (error) {
        console.error("❌ PATCH company stock error:", error);
        const status = error.message === "Stok kaydı bulunamadı." ? 404 : 500;
        res.status(status).json({ errorMessage: error.message });
        return;
    }
};
exports.patchCompanyStockHandler = patchCompanyStockHandler;
const patchCompanyStocksHandler = async (req, res) => {
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
            const { code, ...updateFields } = body;
            const updatedStock = await (0, companyStock_service_1.updateCompanyStock)(code, updateFields, {
                userId,
                companyId,
            }, queryRunner.manager);
            results.push(updatedStock);
        }
        await queryRunner.commitTransaction();
        res.status(200).json(results);
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        console.error("❌ PATCH company stocks error:", error);
        res
            .status(400)
            .json({ errorMessage: error.message || "Stok güncellenemedi." });
    }
    finally {
        await queryRunner.release();
    }
};
exports.patchCompanyStocksHandler = patchCompanyStocksHandler;
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
