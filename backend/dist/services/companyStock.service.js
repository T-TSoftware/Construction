"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decreaseStockQuantity = exports.getProjectStockByProjectId = exports.getCompanyStockById = exports.getCompanyStocks = exports.updateCompanyStock = exports.createCompanyStock = void 0;
const data_source_1 = require("../config/data-source");
const Company_1 = require("../entities/Company");
const CompanyProject_1 = require("../entities/CompanyProject");
const CompanyStock_1 = require("../entities/CompanyStock");
const persist_1 = require("../utils/persist");
const sanitizeRules_1 = require("../utils/sanitizeRules");
const sanitize_1 = require("../utils/sanitize");
const generateCode_1 = require("../utils/generateCode");
//import { generateStockCode } from "../utils/generateCode";
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
    /*const existing = await stockRepo.findOne({
      where: {
        category: data.category,
        name: data.name,
      },
    });
  
    if (existing) {
      throw new Error(`${data.category} - ${data.name} stoğu zaten mevcut.`);
    }*/
    //const code = await generateStockCode(data.category, manager);
    /*
    const categorySlug = slug(data.category).toUpperCase(); // CATEGORY kısmı büyük
    const nameSlug = slug(data.name).toLowerCase(); // name kısmı küçük (istersen upper yap)
    const code = `STK-${categorySlug}-${nameSlug}`;*/
    const code = await (0, generateCode_1.generateEntityCode)(manager, currentUser.companyId, "CompanyStock");
    const stock = stockRepo.create({
        ...data,
        code,
        company: { id: currentUser.companyId },
        project: project ? { id: data.projectId } : null,
        createdBy: { id: currentUser.userId },
        updatedBy: { id: currentUser.userId },
    });
    //return await stockRepo.save(stock);
    return await (0, persist_1.saveRefetchSanitize)({
        entityName: "CompanyStock",
        save: () => stockRepo.save(stock),
        refetch: () => stockRepo.findOneOrFail({
            where: { id: stock.id, company: { id: currentUser.companyId } },
            relations: ["project", "company", "createdBy", "updatedBy"],
        }),
        rules: sanitizeRules_1.sanitizeRules,
        defaultError: "Stok kaydı oluşturulamadı.",
    });
};
exports.createCompanyStock = createCompanyStock;
const updateCompanyStock = async (id, data, currentUser, manager = data_source_1.AppDataSource.manager // ✅ default olarak global manager
) => {
    const stockRepo = manager.getRepository(CompanyStock_1.CompanyStock);
    const projectRepo = manager.getRepository(CompanyProject_1.CompanyProject);
    const stock = await stockRepo.findOne({
        where: {
            id,
            company: { id: currentUser.companyId },
        },
        relations: ["company", "project", "createdBy", "updatedBy"],
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
    //return await stockRepo.save(stock);
    return await (0, persist_1.saveRefetchSanitize)({
        entityName: "CompanyStock",
        save: () => stockRepo.save(stock),
        refetch: () => stockRepo.findOneOrFail({
            where: { id: stock.id, company: { id: currentUser.companyId } },
            relations: ["project", "company", "createdBy", "updatedBy"],
        }),
        rules: sanitizeRules_1.sanitizeRules,
        defaultError: "Stok kaydı güncellenemedi.",
    });
};
exports.updateCompanyStock = updateCompanyStock;
const getCompanyStocks = async (companyId) => {
    const stocks = await stockRepo.find({
        where: { company: { id: companyId } },
        relations: ["createdBy", "updatedBy", "project", "company"],
        order: { createdatetime: "DESC" },
    });
    return (0, sanitize_1.sanitizeEntity)(stocks, "CompanyStock", sanitizeRules_1.sanitizeRules);
};
exports.getCompanyStocks = getCompanyStocks;
const getCompanyStockById = async (id, currentUser) => {
    const stock = await stockRepo.findOne({
        where: {
            id,
            company: { id: currentUser.companyId },
        },
        relations: ["createdBy", "updatedBy", "project", "company"],
    });
    return (0, sanitize_1.sanitizeEntity)(stock, "CompanyStock", sanitizeRules_1.sanitizeRules);
};
exports.getCompanyStockById = getCompanyStockById;
const getProjectStockByProjectId = async (projectId, currentUser, manager = data_source_1.AppDataSource.manager) => {
    const projectStocks = await stockRepo.find({
        where: {
            project: { id: projectId },
            company: { id: currentUser.companyId },
        },
        relations: ["createdBy", "updatedBy", "project", "company"],
    });
    return (0, sanitize_1.sanitizeEntity)(projectStocks, "CompanyStock", sanitizeRules_1.sanitizeRules);
};
exports.getProjectStockByProjectId = getProjectStockByProjectId;
const decreaseStockQuantity = async (options, manager) => {
    const stockRepo = manager.getRepository(CompanyStock_1.CompanyStock);
    const stock = await stockRepo.findOneByOrFail({ id: options.stockId });
    if (stock.quantity < options.quantity) {
        throw new Error(`Stok yetersiz: Mevcut ${stock.quantity}, istenen ${options.quantity}`);
    }
    stock.quantity -= options.quantity;
    stock.updatedatetime = new Date();
    await stockRepo.save(stock);
};
exports.decreaseStockQuantity = decreaseStockQuantity;
