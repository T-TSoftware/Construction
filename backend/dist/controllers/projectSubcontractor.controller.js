"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patchProjectSubcontractorHandler = exports.getProjectSubcontractorsHandler = exports.postProjectSubcontractorHandler = void 0;
const projectSubcontractor_service_1 = require("../services/projectSubcontractor.service");
const postProjectSubcontractorHandler = async (req, res) => {
    if (req.user?.role !== "superadmin") {
        res.status(403).json({ error: "Yalnızca superadmin işlemi yapabilir." });
        return;
    }
    try {
        const { projectId } = req.params;
        const { category, companyName, unit, unitPrice, quantity, contractAmount, paidAmount, status, description, } = req.body;
        if (!category) {
            res.status(400).json({ error: "Kategori zorunludur." });
            return;
        }
        const userId = req.user.userId.toString();
        const companyId = req.user.companyId;
        const newSubcontractor = await (0, projectSubcontractor_service_1.createProjectSubcontractor)({
            projectId,
            category,
            companyName,
            unit,
            unitPrice,
            quantity,
            contractAmount,
            paidAmount,
            status,
            description,
        }, { userId, companyId });
        res.status(201).json(newSubcontractor);
    }
    catch (error) {
        console.error("❌ POST project subcontractor error:", error);
        res.status(500).json({ error: "Tedarikçi oluşturulamadı." });
        return;
    }
};
exports.postProjectSubcontractorHandler = postProjectSubcontractorHandler;
const getProjectSubcontractorsHandler = async (req, res) => {
    try {
        const { projectId } = req.params;
        const userId = req.user.userId.toString();
        const companyId = req.user.companyId;
        const subcontractors = await (0, projectSubcontractor_service_1.getProjectSubcontractors)(projectId, companyId);
        res.status(200).json(subcontractors);
    }
    catch (error) {
        console.error("❌ GET project subcontractors error:", error);
        res.status(500).json({ error: "Tedarikçiler alınamadı." });
        return;
    }
};
exports.getProjectSubcontractorsHandler = getProjectSubcontractorsHandler;
const patchProjectSubcontractorHandler = async (req, res) => {
    if (req.user?.role !== "superadmin") {
        res.status(403).json({ error: "Yalnızca superadmin işlemi yapabilir." });
        return;
    }
    try {
        const { projectId, code } = req.params;
        const userId = req.user.userId.toString();
        const companyId = req.user.companyId;
        const updatedSubcontractor = await (0, projectSubcontractor_service_1.updateProjectSubcontractor)(projectId, code, req.body, { userId, companyId });
        res.status(200).json(updatedSubcontractor);
    }
    catch (error) {
        console.error("❌ PATCH project subcontractor error:", error);
        const status = error.message === "Tedarikçi bulunamadı." ? 404 : 500;
        res.status(status).json({ error: error.message });
        return;
    }
};
exports.patchProjectSubcontractorHandler = patchProjectSubcontractorHandler;
