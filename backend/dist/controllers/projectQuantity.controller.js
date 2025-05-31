"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectQuantitiesHandler = exports.postProjectQuantityHandler = void 0;
const projectQuantity_service_1 = require("../services/projectQuantity.service");
const postProjectQuantityHandler = async (req, res) => {
    if (req.user?.role !== "superadmin") {
        res.status(403).json({ error: "Yalnızca superadmin işlem yapabilir." });
        return;
    }
    try {
        const { projectId } = req.params;
        const { quantityItemCode, quantity, unit, description, category } = req.body;
        if (!quantityItemCode || !quantity || !unit) {
            res.status(400).json({ error: "Gerekli alanlar eksik." });
            return;
        }
        const userId = req.user.userId.toString();
        const newRecord = await (0, projectQuantity_service_1.createProjectQuantity)({
            projectId,
            quantityItemCode,
            quantity,
            unit,
            description,
            category,
        }, { userId });
        res.status(201).json({
            message: "Metraj başarıyla eklendi.",
            id: newRecord.id,
        });
    }
    catch (error) {
        console.error("❌ POST project quantity error:", error);
        res.status(500).json({ error: "Metraj kaydı oluşturulamadı." });
        return;
    }
};
exports.postProjectQuantityHandler = postProjectQuantityHandler;
const getProjectQuantitiesHandler = async (req, res) => {
    try {
        const { projectId } = req.params;
        if (!projectId) {
            res.status(400).json({ error: "projectId parametresi zorunludur." });
            return;
        }
        const result = await (0, projectQuantity_service_1.getProjectQuantities)(projectId);
        res.status(200).json(result);
    }
    catch (error) {
        console.error("❌ GET project quantities error:", error);
        res.status(500).json({ error: "Metrajlar alınamadı." });
        return;
    }
};
exports.getProjectQuantitiesHandler = getProjectQuantitiesHandler;
