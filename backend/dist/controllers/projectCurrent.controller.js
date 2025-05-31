"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectCurrentsHandler = exports.postProjectCurrentHandler = void 0;
const projectCurrents_service_1 = require("../services/projectCurrents.service");
const postProjectCurrentHandler = async (req, res) => {
    if (req.user?.role !== "superadmin") {
        res.status(403).json({ error: "Yalnızca superadmin işlem yapabilir." });
        return;
    }
    try {
        const { projectId } = req.params;
        const { balanceCode, type, amount, currency, transactionDate, description, } = req.body;
        if (!balanceCode || !type || !amount || !currency || !description) {
            res.status(400).json({ error: "Gerekli alanlar eksik." });
            return;
        }
        const userId = req.user.userId.toString();
        const newRecord = await (0, projectCurrents_service_1.createProjectCurrent)({
            projectId,
            balanceCode,
            type,
            amount,
            currency,
            transactionDate,
            description,
        }, { userId });
        res.status(201).json({
            message: "Cari hareket başarıyla eklendi.",
            id: newRecord.id,
        });
    }
    catch (error) {
        console.error("❌ POST project current error:", error);
        res
            .status(500)
            .json({ error: error.message || "Cari hareket oluşturulamadı." });
        return;
    }
};
exports.postProjectCurrentHandler = postProjectCurrentHandler;
const getProjectCurrentsHandler = async (req, res) => {
    try {
        const { projectId } = req.params;
        if (!projectId) {
            res.status(400).json({ error: "Proje ID zorunludur." });
            return;
        }
        const currents = await (0, projectCurrents_service_1.getProjectCurrents)(projectId);
        res.status(200).json(currents);
    }
    catch (error) {
        console.error("❌ GET project currents error:", error);
        res.status(500).json({ error: "Cari hareketler alınamadı." });
        return;
    }
};
exports.getProjectCurrentsHandler = getProjectCurrentsHandler;
