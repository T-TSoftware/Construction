"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBalance = exports.updateBalance = exports.createBalance = exports.getCompanyBalances = void 0;
const data_source_1 = require("../config/data-source");
const CompanyBalance_1 = require("../entities/CompanyBalance");
const generateCode_1 = require("../utils/generateCode");
const CompanyBalanceView_1 = require("../views/CompanyBalanceView");
const balanceRepo = data_source_1.AppDataSource.getRepository(CompanyBalance_1.CompanyBalance);
const viewRepo = data_source_1.AppDataSource.getRepository(CompanyBalanceView_1.CompanyBalanceView);
const getCompanyBalances = async (companyId) => {
    try {
        const all = await viewRepo.findBy({ companyId });
        return all.map(({ id, code, name, amount, currency }) => ({
            id,
            code,
            name,
            amount,
            currency,
        }));
    }
    catch (error) {
        console.error("❌ [getCompanyBalances] error:", error);
        throw new Error("Bakiye bilgileri alınamadı.");
    }
};
exports.getCompanyBalances = getCompanyBalances;
const createBalance = async (companyId, name, amount, currency, createdBy) => {
    try {
        const prefix = name.slice(0, 3).toUpperCase();
        const latest = await balanceRepo
            .createQueryBuilder("balance")
            .where("balance.code LIKE :prefix", { prefix: `${prefix}%` })
            .orderBy("balance.code", "DESC")
            .limit(1)
            .getOne();
        const code = (0, generateCode_1.generateNextBalanceCode)(latest?.code ?? null, prefix);
        const balance = balanceRepo.create({
            code,
            company: { id: companyId },
            name,
            amount,
            currency,
            createdBy,
            updatedBy: createdBy,
        });
        return await balanceRepo.save(balance);
    }
    catch (error) {
        console.error("❌ [createBalance] error:", error);
        throw new Error("Bakiye oluşturulamadı.");
    }
};
exports.createBalance = createBalance;
const updateBalance = async (id, fields, updatedBy) => {
    try {
        const balance = await balanceRepo.findOne({ where: { id } });
        if (!balance)
            return null;
        Object.assign(balance, fields);
        balance.updatedBy = updatedBy;
        return await balanceRepo.save(balance);
    }
    catch (error) {
        console.error("❌ [updateBalance] error:", error);
        throw new Error("Bakiye güncellenemedi.");
    }
};
exports.updateBalance = updateBalance;
const deleteBalance = async (id) => {
    try {
        const result = await balanceRepo.delete(id);
        return result.affected !== 0;
    }
    catch (error) {
        console.error("❌ [deleteBalance] error:", error);
        throw new Error("Bakiye silinemedi.");
    }
};
exports.deleteBalance = deleteBalance;
