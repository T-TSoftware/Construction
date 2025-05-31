"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patchProjectSupplierHandler = exports.getProjectSuppliersHandler = exports.postProjectSupplierHandler = void 0;
const projectSupplier_service_1 = require("../services/projectSupplier.service");
const data_source_1 = require("../config/data-source"); // transaction için gerekli
const postProjectSupplierHandler = async (req, res) => {
    if (req.user?.role !== "superadmin") {
        res.status(403).json({ error: "Yalnızca superadmin işlem yapabilir." });
        return;
    }
    const queryRunner = data_source_1.AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction(); // 🔁 transaction başlatılır
    try {
        const { projectId } = req.params;
        const userId = req.user.userId.toString();
        // 🔁 Artık her zaman array geleceği için döngüyle ilerliyoruz
        const results = [];
        for (const body of req.body) {
            const { quantityItemCode, category, companyName, unit, unitPrice, quantity, contractAmount, paidAmount, status, description, } = body;
            // ❗ Her item için zorunlu alan kontrolü
            /*if (!quantityItemCode || !category || !unit || !status) {
              res.status(400).json({ error: "Zorunlu alanlar eksik." });
              return;
            }*/
            /*if (!quantityItemCode || !category || !unit || !status) {
              throw new Error("Zorunlu alanlar eksik."); // ❌ Hata fırlat → transaction rollback
            }*/
            const newSupplier = await (0, projectSupplier_service_1.createProjectSupplier)({
                projectId,
                quantityItemCode,
                category,
                companyName,
                unit,
                unitPrice,
                quantity,
                contractAmount,
                paidAmount,
                status,
                description,
            }, { userId });
            results.push(newSupplier);
        }
        await queryRunner.commitTransaction(); // ✅ Hepsi başarılıysa commit
        res.status(201).json(results);
    }
    catch (error) {
        await queryRunner.rollbackTransaction(); // ❌ Hata varsa tüm kayıtlar geri alınır
        console.error("❌ POST project supplier error:", error);
        res.status(500).json({ error: "Tedarikçi oluşturulamadı." });
        return;
    }
};
exports.postProjectSupplierHandler = postProjectSupplierHandler;
const getProjectSuppliersHandler = async (req, res) => {
    try {
        const { projectId } = req.params;
        const suppliers = await (0, projectSupplier_service_1.getProjectSuppliers)(projectId);
        res.status(200).json(suppliers);
    }
    catch (error) {
        console.error("❌ GET project suppliers error:", error);
        res.status(500).json({ error: "Tedarikçiler alınamadı." });
        return;
    }
};
exports.getProjectSuppliersHandler = getProjectSuppliersHandler;
const patchProjectSupplierHandler = async (req, res) => {
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
        const projectId = req.params.projectId;
        const updatedSuppliers = [];
        for (const body of req.body) {
            const { code, ...updateData } = body;
            if (!code) {
                throw new Error("Güncellenecek kaydın 'code' alanı zorunludur.");
            }
            const updated = await (0, projectSupplier_service_1.updateProjectSupplier)(projectId, code, updateData, { userId }, queryRunner.manager);
            updatedSuppliers.push(updated);
        }
        await queryRunner.commitTransaction();
        res.status(200).json(updatedSuppliers);
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        console.error("❌ PATCH project suppliers error:", error);
        res
            .status(500)
            .json({ errorMessage: error.message || "Tedarikçiler güncellenemedi." });
    }
    finally {
        await queryRunner.release();
    }
};
exports.patchProjectSupplierHandler = patchProjectSupplierHandler;
// multiple patch will be added according to business needs...
