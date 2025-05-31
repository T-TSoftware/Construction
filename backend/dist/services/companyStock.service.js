"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompanyStocks = exports.updateCompanyStock = exports.createCompanyStock = void 0;
const data_source_1 = require("../config/data-source");
const Company_1 = require("../entities/Company");
const CompanyProject_1 = require("../entities/CompanyProject");
const CompanyStock_1 = require("../entities/CompanyStock");
const generateCode_1 = require("../utils/generateCode");
const stockRepo = data_source_1.AppDataSource.getRepository(CompanyStock_1.CompanyStock);
const companyRepo = data_source_1.AppDataSource.getRepository(Company_1.Company);
const projectRepo = data_source_1.AppDataSource.getRepository(CompanyProject_1.CompanyProject);
const createCompanyStock = async (data, currentUser, manager = data_source_1.AppDataSource.manager) => {
    const stockRepo = manager.getRepository(CompanyStock_1.CompanyStock);
    const companyRepo = manager.getRepository(Company_1.Company);
    const projectRepo = manager.getRepository(CompanyProject_1.CompanyProject);
    const company = await companyRepo.findOneByOrFail({
        id: currentUser.companyId,
    });
    const project = data.projectId
        ? await projectRepo.findOneByOrFail({ id: data.projectId })
        : null;
    const existing = await stockRepo.findOne({
        where: {
            category: data.category,
            name: data.name,
        },
    });
    if (existing) {
        throw new Error(`${data.category} - ${data.name} stoğu zaten mevcut.`);
    }
    const code = await (0, generateCode_1.generateStockCode)(data.category, manager);
    const stock = stockRepo.create({
        ...data,
        code,
        company: { id: company.id },
        project: project ? { id: data.projectId } : null,
        createdBy: { id: currentUser.userId },
        updatedBy: { id: currentUser.userId },
    });
    return await stockRepo.save(stock);
};
exports.createCompanyStock = createCompanyStock;
const updateCompanyStock = async (code, data, currentUser, manager = data_source_1.AppDataSource.manager // ✅ default olarak global manager
) => {
    const stockRepo = manager.getRepository(CompanyStock_1.CompanyStock);
    const projectRepo = manager.getRepository(CompanyProject_1.CompanyProject);
    const stock = await stockRepo.findOne({
        where: {
            code,
            company: { id: currentUser.companyId },
        },
        relations: ["company", "project"],
    });
    if (!stock) {
        throw new Error("Stok kaydı bulunamadı.");
    }
    if (data.projectId !== undefined) {
        if (data.projectId === null) {
            stock.project = null;
        }
        else {
            const project = await projectRepo.findOneByOrFail({ id: data.projectId });
            stock.project = project;
        }
    }
    stock.name = data.name ?? stock.name;
    stock.category = data.category ?? stock.category;
    stock.description = data.description ?? stock.description;
    stock.unit = data.unit ?? stock.unit;
    stock.quantity = data.quantity ?? stock.quantity;
    stock.minimumQuantity = data.minimumQuantity ?? stock.minimumQuantity;
    stock.location = data.location ?? stock.location;
    stock.stockDate = data.stockDate ?? stock.stockDate;
    stock.updatedBy = { id: currentUser.userId };
    stock.updatedatetime = new Date();
    return await stockRepo.save(stock);
};
exports.updateCompanyStock = updateCompanyStock;
const getCompanyStocks = async (companyId) => {
    const stocks = await stockRepo.find({
        where: { company: { id: companyId } },
        relations: ["createdBy", "updatedBy", "project"],
        order: { createdatetime: "DESC" },
    });
    return stocks.map((s) => ({
        code: s.code,
        name: s.name,
        category: s.category,
        unit: s.unit,
        quantity: s.quantity,
        minimumQuantity: s.minimumQuantity,
        description: s.description,
        location: s.location,
        stockDate: s.stockDate,
        projectCode: s.project?.code ?? null,
        createdBy: s.createdBy?.name ?? null,
        updatedBy: s.updatedBy?.name ?? null,
        createdatetime: s.createdatetime,
        updatedatetime: s.updatedatetime,
    }));
};
exports.getCompanyStocks = getCompanyStocks;
