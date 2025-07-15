"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDailyCashflowHandler = void 0;
const companyCashFlow_service_1 = require("../services/companyCashFlow.service");
const getDailyCashflowHandler = async (req, res) => {
    try {
        // 👤 Kullanıcıdan şirket bilgisi al
        const companyId = req.user?.companyId;
        if (!companyId) {
            res
                .status(403)
                .json({ errorMessage: "Geçerli şirket bilgisi bulunamadı." });
            return;
        }
        // 📆 Query parametrelerini oku
        const { startDate, endDate, method, transactionDate } = req.query;
        // 🧠 View'den günlük nakit akışı verilerini al
        const result = await (0, companyCashFlow_service_1.getDailyCashflow)({ companyId }, {
            startDate: startDate,
            endDate: endDate,
            method: method,
            transactionDate: transactionDate,
        });
        // ✅ Yanıtla
        res.status(200).json(result);
    }
    catch (error) {
        console.error("❌ GET daily cashflow error:", error);
        res.status(500).json({
            errorMessage: "Nakit akışı verileri alınamadı.",
            detail: error.message,
        });
    }
};
exports.getDailyCashflowHandler = getDailyCashflowHandler;
