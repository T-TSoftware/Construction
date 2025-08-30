"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateManyCompanyBalances = exports.getCompanyBalances = exports.deleteBalance = exports.updateBalance = exports.createBalance = void 0;
const data_source_1 = require("../config/data-source");
const CompanyBalance_1 = require("../entities/CompanyBalance");
const generateCode_1 = require("../utils/generateCode");
const typeorm_1 = require("typeorm");
const balanceRepo = data_source_1.AppDataSource.getRepository(CompanyBalance_1.CompanyBalance);
const createBalance = async (data, currentUser, manager = data_source_1.AppDataSource.manager) => {
    const balanceRepo = manager.getRepository(CompanyBalance_1.CompanyBalance);
    /*const prefix = data.name.slice(0, 3).toUpperCase();
  
    const latest = await balanceRepo
      .createQueryBuilder("balance")
      .where("balance.code LIKE :prefix", { prefix: `${prefix}%` })
      .orderBy("balance.code", "DESC")
      .limit(1)
      .getOne();
  
    const code = generateNextBalanceCode(latest?.code ?? null, prefix);*/
    const code = await (0, generateCode_1.generateEntityCode)(manager, currentUser.companyId, "CompanyBalance");
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
const updateManyCompanyBalances = async (manager, updates, currentUser) => {
    if (!Array.isArray(updates) || updates.length === 0) {
        throw new Error("Güncelleme için en az bir kayıt gönderilmelidir.");
    }
    const repo = manager.getRepository(CompanyBalance_1.CompanyBalance);
    const ids = updates.map((u) => u.id);
    // Mevcutları tek sorguda çek (tenant filtresiyle)
    const existing = await repo.find({
        where: { id: (0, typeorm_1.In)(ids), company: { id: currentUser.companyId } },
        relations: ["company"],
    });
    if (existing.length !== ids.length) {
        // Hangi kayıt yok/başkasına ait, tespit etmek istersen:
        const foundIds = new Set(existing.map((e) => e.id));
        const missing = ids.filter((x) => !foundIds.has(x));
        throw new Error(`Bazı bakiye kayıtları bulunamadı veya yetkiniz yok. ID'ler: ${missing.join(", ")}`);
    }
    // Map ile hızlı erişim
    const byId = new Map(existing.map((e) => [e.id, e]));
    // Sadece izin verilen alanları ata
    for (const patch of updates) {
        const entity = byId.get(patch.id);
        if (patch.name !== undefined) {
            entity.name = patch.name.trim();
        }
        if (patch.amount !== undefined) {
            entity.amount = Number(patch.amount);
        }
        if (patch.currency !== undefined) {
            entity.currency = patch.currency.trim().toUpperCase();
        }
        entity.updatedBy = currentUser.userId;
        // updatedatetime, @UpdateDateColumn ile otomatik güncellenir
    }
    // Toplu kaydet
    const saved = await repo.save(existing);
    return saved;
};
exports.updateManyCompanyBalances = updateManyCompanyBalances;
