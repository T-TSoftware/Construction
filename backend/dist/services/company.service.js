"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCompany = exports.updateCompany = exports.createCompany = exports.getCompanyById = exports.getAllCompanies = void 0;
// src/services/company.service.ts
const data_source_1 = require("../config/data-source");
const Company_1 = require("../entities/Company");
const generateCode_1 = require("../utils/generateCode");
const getAllCompanies = async () => {
    return await data_source_1.AppDataSource.getRepository(Company_1.Company).find();
};
exports.getAllCompanies = getAllCompanies;
const getCompanyById = async (id) => {
    return await data_source_1.AppDataSource.getRepository(Company_1.Company).findOneBy({ id });
};
exports.getCompanyById = getCompanyById;
const createCompany = async (name) => {
    const repo = data_source_1.AppDataSource.getRepository(Company_1.Company);
    const prefix = name.slice(0, 3).toUpperCase();
    const latest = await repo
        .createQueryBuilder("company")
        .where("company.code LIKE :prefix", { prefix: `${prefix}%` })
        .orderBy("company.code", "DESC")
        .limit(1)
        .getOne();
    const code = (0, generateCode_1.generateNextCompanyCode)(latest?.code ?? null, name);
    const company = repo.create({ name, code });
    return await repo.save(company);
};
exports.createCompany = createCompany;
const updateCompany = async (id, name) => {
    const repo = data_source_1.AppDataSource.getRepository(Company_1.Company);
    const company = await repo.findOneBy({ id });
    if (!company)
        return null;
    company.name = name;
    return await repo.save(company);
};
exports.updateCompany = updateCompany;
const deleteCompany = async (id) => {
    const repo = data_source_1.AppDataSource.getRepository(Company_1.Company);
    const result = await repo.delete(id);
    return result.affected === 1;
};
exports.deleteCompany = deleteCompany;
