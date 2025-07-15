"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentMovementsHandler = void 0;
const companyCurrentMovement_service_1 = require("../services/companyCurrentMovement.service");
const getCurrentMovementsHandler = async (req, res) => {
    try {
        const companyId = req.user?.companyId;
        if (!companyId) {
            res.status(403).json({ errorMessage: "Şirket bilgisi bulunamadı." });
            return;
        }
        const filters = req.query;
        const data = await (0, companyCurrentMovement_service_1.getCurrentMovements)({ companyId }, filters);
        res.status(200).json(data);
    }
    catch (error) {
        console.error("❌ [getCurrentMovementsHandler] Error:", error);
        res.status(500).json({
            errorMessage: error.message || "Cari hareketler alınamadı.",
        });
    }
};
exports.getCurrentMovementsHandler = getCurrentMovementsHandler;
