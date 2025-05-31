"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEstimatedCostsByProjectHandler = exports.postEstimatedCostHandler = void 0;
const projectEstimatedCost_service_1 = require("../services/projectEstimatedCost.service");
const postEstimatedCostHandler = async (req, res) => {
    if (req.user?.role !== "superadmin") {
        res.status(403).json({ error: "Yalnızca superadmin işlemi yapabilir." });
        return;
    }
    try {
        const { projectId } = req.params;
        const { name, category, description, unit, unitPrice, quantity } = req.body;
        const userId = req.user.userId.toString();
        const newEstimatedCost = await (0, projectEstimatedCost_service_1.createEstimatedCost)({
            projectId,
            name,
            category,
            description,
            unit,
            unitPrice,
            quantity,
        }, {
            userId,
        });
        res.status(201).json(newEstimatedCost);
    }
    catch (error) {
        console.error("❌ POST estimated cost error:", error);
        res.status(500).json({ error: "Tahmini maliyet oluşturulamadı." });
    }
};
exports.postEstimatedCostHandler = postEstimatedCostHandler;
const getEstimatedCostsByProjectHandler = async (req, res) => {
    try {
        const { projectId } = req.params;
        const estimatedCosts = await (0, projectEstimatedCost_service_1.getEstimatedCostsByProject)(projectId);
        res.status(200).json(estimatedCosts);
    }
    catch (error) {
        console.error("❌ GET estimated costs error:", error);
        res.status(500).json({ error: "Hesaplanan maliyetler alınamadı." });
    }
};
exports.getEstimatedCostsByProjectHandler = getEstimatedCostsByProjectHandler;
