"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUpcomingCollectionsHandler = exports.getUpcomingPaymentsHandler = void 0;
const companyUpcomingTransaction_service_1 = require("../services/companyUpcomingTransaction.service");
const getUpcomingPaymentsHandler = async (req, res) => {
    try {
        const companyId = req.user?.companyId;
        if (!companyId) {
            res
                .status(403)
                .json({ errorMessage: "Geçerli şirket bilgisi bulunamadı." });
            return;
        }
        const { startDate, endDate } = req.query;
        const result = await (0, companyUpcomingTransaction_service_1.getUpcomingPayments)({ companyId }, {
            startDate: startDate,
            endDate: endDate,
        });
        res.status(200).json(result);
    }
    catch (error) {
        console.error("❌ GET upcoming payments error:", error);
        res.status(500).json({
            errorMessage: "Yaklaşan ödeme verileri alınamadı.",
            detail: error.message,
        });
    }
};
exports.getUpcomingPaymentsHandler = getUpcomingPaymentsHandler;
const getUpcomingCollectionsHandler = async (req, res) => {
    try {
        const companyId = req.user?.companyId;
        if (!companyId) {
            res
                .status(403)
                .json({ errorMessage: "Geçerli şirket bilgisi bulunamadı." });
            return;
        }
        const { startDate, endDate } = req.query;
        const result = await (0, companyUpcomingTransaction_service_1.getUpcomingCollections)({ companyId }, {
            startDate: startDate,
            endDate: endDate,
        });
        res.status(200).json(result);
    }
    catch (error) {
        console.error("❌ GET upcoming collections error:", error);
        res.status(500).json({
            errorMessage: "Yaklaşan tahsilat verileri alınamadı.",
            detail: error.message,
        });
    }
};
exports.getUpcomingCollectionsHandler = getUpcomingCollectionsHandler;
