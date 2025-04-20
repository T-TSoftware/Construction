"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCompanyBalanceHandler = exports.putCompanyBalanceHandler = exports.postCompanyBalanceHandler = exports.getCompanyBalancesHandler = void 0;
const companyBalance_service_1 = require("../services/companyBalance.service");
// 📌 Listeleme – Her kullanıcı erişebilir
const getCompanyBalancesHandler = async (req, res) => {
    try {
        const companyId = req.user.companyId;
        const balances = await (0, companyBalance_service_1.getCompanyBalances)(companyId);
        res.json(balances);
    }
    catch (error) {
        console.error("❌ GET balances error:", error);
        res.status(500).json({ error: "Bakiye listesi alınamadı." });
    }
};
exports.getCompanyBalancesHandler = getCompanyBalancesHandler;
// 📌 Oluşturma – Sadece superadmin
const postCompanyBalanceHandler = async (req, res) => {
    if (req.user?.role !== "superadmin") {
        res.status(403).json({ error: "Yalnızca superadmin işlemi yapabilir." });
        return;
    }
    try {
        const { name, amount, currency } = req.body;
        const createdBy = req.user.userId.toString();
        const companyId = req.user.companyId;
        const newBalance = await (0, companyBalance_service_1.createBalance)(companyId, name, amount, currency, createdBy);
        res.status(201).json(newBalance);
    }
    catch (error) {
        console.error("❌ POST balance error:", error);
        res.status(500).json({ error: "Bakiye oluşturulamadı." });
    }
};
exports.postCompanyBalanceHandler = postCompanyBalanceHandler;
// 📌 Güncelleme – Sadece superadmin
const putCompanyBalanceHandler = async (req, res) => {
    if (req.user?.role !== "superadmin") {
        res.status(403).json({ error: "Yalnızca superadmin işlemi yapabilir." });
        return;
    }
    try {
        const updatedBy = req.user.userId.toString();
        const balanceId = req.params.id;
        const fields = req.body;
        const updated = await (0, companyBalance_service_1.updateBalance)(balanceId, fields, updatedBy);
        if (!updated) {
            res.status(404).json({ error: "Bakiye bulunamadı." });
            return;
        }
        res.json(updated);
    }
    catch (error) {
        console.error("❌ PUT balance error:", error);
        res.status(500).json({ error: "Bakiye güncellenemedi." });
    }
};
exports.putCompanyBalanceHandler = putCompanyBalanceHandler;
// 📌 Silme – Sadece superadmin
const deleteCompanyBalanceHandler = async (req, res) => {
    if (req.user?.role !== "superadmin") {
        res.status(403).json({ error: "Yalnızca superadmin işlemi yapabilir." });
        return;
    }
    try {
        const id = Number(req.params.id);
        const deleted = await (0, companyBalance_service_1.deleteBalance)(id);
        if (!deleted) {
            res.status(404).json({ error: "Bakiye bulunamadı." });
            return;
        }
        res.status(204).send();
    }
    catch (error) {
        console.error("❌ DELETE balance error:", error);
        res.status(500).json({ error: "Bakiye silinemedi." });
    }
};
exports.deleteCompanyBalanceHandler = deleteCompanyBalanceHandler;
