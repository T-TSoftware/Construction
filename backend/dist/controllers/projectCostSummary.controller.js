"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectCostSummaryHandler = void 0;
const projectCostSummary_service_1 = require("../services/projectCostSummary.service");
const getProjectCostSummaryHandler = async (req, res) => {
    try {
        const { projectId } = req.params;
        if (!projectId) {
            res.status(400).json({ error: "projectId parametresi zorunludur." });
            return;
        }
        const { quantityItemCode, overlimitYn } = req.query;
        const summary = await (0, projectCostSummary_service_1.getProjectCostSummary)(projectId, { companyId: req.user.companyId }, {
            quantityItemCode: quantityItemCode,
            overlimitYn: overlimitYn
        });
        res.status(200).json(summary);
    }
    catch (error) {
        console.error("❌ GET cost summary error:", error);
        res.status(500).json({ error: "Maliyet özeti alınamadı." });
    }
};
exports.getProjectCostSummaryHandler = getProjectCostSummaryHandler;
