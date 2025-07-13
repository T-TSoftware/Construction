"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompanyBalances = exports.deleteBalance = exports.updateBalance = exports.createBalance = void 0;
const data_source_1 = require("../config/data-source");
const CompanyBalance_1 = require("../entities/CompanyBalance");
const generateCode_1 = require("../utils/generateCode");
const balanceRepo = data_source_1.AppDataSource.getRepository(CompanyBalance_1.CompanyBalance);
const createBalance = async (data, currentUser, manager = data_source_1.AppDataSource.manager) => {
    const balanceRepo = manager.getRepository(CompanyBalance_1.CompanyBalance);
    const prefix = data.name.slice(0, 3).toUpperCase();
    const latest = await balanceRepo
        .createQueryBuilder("balance")
        .where("balance.code LIKE :prefix", { prefix: `${prefix}%` })
        .orderBy("balance.code", "DESC")
        .limit(1)
        .getOne();
    const code = (0, generateCode_1.generateNextBalanceCode)(latest?.code ?? null, prefix);
    const balance = balanceRepo.create({
        code,
        name: data.name,
        amount: data.amount,
        currency: data.currency,
        company: { id: currentUser.companyId },
        createdBy: currentUser.userId,
        updatedBy: currentUser.userId,
    });
    return await balanceRepo.save(balance);
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
const getCompanyBalances = async (currentUser, query) => {
    const conditions = [`companyId = $1`];
    const params = [currentUser.companyId];
    if (query.name) {
        conditions.push(`"name" = $${params.length + 1}`);
        params.push(query.name);
    }
    if (query.currency) {
        conditions.push(`currency = $${params.length + 1}`);
        params.push(query.currency);
    }
    if (query.code) {
        conditions.push(`code = $${params.length + 1}`);
        params.push(query.code);
    }
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const sql = `
    SELECT *
    FROM artikonsept.v_companybalances
    ${whereClause.toLowerCase()}
  `;
    return await data_source_1.AppDataSource.manager.query(sql, params);
};
exports.getCompanyBalances = getCompanyBalances;
