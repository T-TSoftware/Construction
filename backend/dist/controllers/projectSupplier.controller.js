"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patchProjectSupplierHandler = exports.getProjectSupplierByIdHandler = exports.getProjectSuppliersHandler = exports.postProjectSupplierHandler = void 0;
const projectSupplier_service_1 = require("../services/projectSupplier.service");
const data_source_1 = require("../config/data-source"); // transaction için gerekli
const postProjectSupplierHandler = async (req, res) => {
    if (req.user?.role !== "superadmin") {
        res.status(403).json({ error: "Yalnızca superadmin işlem yapabilir." });
        return;
    }
    const queryRunner = data_source_1.AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const { projectId } = req.params;
        const userId = req.user.userId.toString();
        const companyId = req.user.companyId;
        const { category, companyName, unit, unitPrice, quantity, contractAmount, status, description, projectQuantityId, addedFromQuantityYN, } = req.body;
        const newSupplier = await (0, projectSupplier_service_1.createProjectSupplier)({
            projectId,
            category,
            companyName,
            unit,
            unitPrice,
            quantity,
            contractAmount,
            status,
            description,
            projectQuantityId,
            addedFromQuantityYN,
        }, { userId, companyId }, queryRunner.manager);
        await queryRunner.commitTransaction();
        res.status(201).json(newSupplier);
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        console.error("❌ POST project supplier error:", error);
        res.status(500).json({
            error: error.message || "Tedarikçi oluşturulamadı.",
        });
    }
    finally {
        await queryRunner.release();
    }
};
exports.postProjectSupplierHandler = postProjectSupplierHandler;
const getProjectSuppliersHandler = async (req, res) => {
    try {
        const { projectId } = req.params;
        const userId = req.user.userId.toString();
        const companyId = req.user.companyId;
        const suppliers = await (0, projectSupplier_service_1.getProjectSuppliers)(projectId, {
            userId,
            companyId,
        });
        res.status(200).json(suppliers);
    }
    catch (error) {
        console.error("❌ GET project suppliers error:", error);
        res.status(500).json({ error: "Tedarikçiler alınamadı." });
        return;
    }
};
exports.getProjectSuppliersHandler = getProjectSuppliersHandler;
const getProjectSupplierByIdHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId.toString();
        const companyId = req.user.companyId;
        const supplier = await (0, projectSupplier_service_1.getProjectSupplierById)(id, { userId, companyId });
        res.status(200).json(supplier);
    }
    catch (error) {
        console.error("❌ GET project suppliers error:", error);
        res.status(500).json({ error: "Tedarikçiler alınamadı." });
        return;
    }
};
exports.getProjectSupplierByIdHandler = getProjectSupplierByIdHandler;
const patchProjectSupplierHandler = async (req, res) => {
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
        // 💡 Route'u mümkünse /projects/:projectId/suppliers/:id yapın.
        // Aşağıda supplier id'yi alıyoruz:
        const { id } = req.params; // supplier id
        const updateData = req.body; // tek obje
        const updated = await (0, projectSupplier_service_1.updateProjectSupplier)(id, updateData, { userId, companyId }, queryRunner.manager);
        await queryRunner.commitTransaction();
        res.status(200).json(updated);
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        console.error("❌ PATCH project supplier error:", error);
        res.status(500).json({
            errorMessage: error.message || "Tedarikçi güncellenemedi.",
        });
    }
    finally {
        await queryRunner.release();
    }
};
exports.patchProjectSupplierHandler = patchProjectSupplierHandler;
// multiple patch will be added according to business needs...
