"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBankMovementsHandler = void 0;
const companyBankMovement_service_1 = require("../services/companyBankMovement.service");
const getBankMovementsHandler = async (req, res) => {
    try {
        const result = await (0, companyBankMovement_service_1.getBankMovements)(req.query);
        res.status(200).json(result);
    }
    catch (error) {
        console.error("❌ Error fetching bank movements:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.getBankMovementsHandler = getBankMovementsHandler;
