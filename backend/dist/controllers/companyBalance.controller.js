"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCompanyBalanceHandler = exports.putCompanyBalanceHandler = exports.postCompanyBalanceHandler = exports.getCompanyBalancesHandler = void 0;
const companyBalance_service_1 = require("../services/companyBalance.service");
const data_source_1 = require("../config/data-source");
// 📌 Listeleme – Her kullanıcı erişebilir
const getCompanyBalancesHandler = async (req, res) => {
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
        const { name, currency, code } = req.query;
        // 🧠 View'den günlük nakit akışı verilerini al
        const result = await (0, companyBalance_service_1.getCompanyBalances)({ companyId }, {
            name: name,
            currency: currency,
            code: code,
        });
        // ✅ Yanıtla
        res.status(200).json(result);
    }
    catch (error) {
        console.error("❌ GET balances error:", error);
        res.status(500).json({
            errorMessage: "Bakiye verileri alınamadı.",
            detail: error.message,
        });
    }
};
exports.getCompanyBalancesHandler = getCompanyBalancesHandler;
// 📌 Oluşturma – Sadece superadmin
const postCompanyBalanceHandler = async (req, res) => {
    if (req.user?.role !== "superadmin") {
        res.status(403).json({ error: "Yalnızca superadmin işlemi yapabilir." });
        return;
    }
    const queryRunner = data_source_1.AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const userId = req.user.userId.toString();
        const companyId = req.user.companyId;
        const results = [];
        for (const body of req.body) {
            const { name, amount, currency } = body;
            const newBalance = await (0, companyBalance_service_1.createBalance)({ name, amount, currency }, { userId, companyId }, queryRunner.manager);
            results.push(newBalance);
        }
        await queryRunner.commitTransaction();
        res.status(201).json(results);
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        console.error("❌ POST balance error:", error);
        res.status(500).json({
            errorMessage: error.message || "Bakiyeler oluşturulamadı.",
        });
    }
    finally {
        await queryRunner.release();
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
