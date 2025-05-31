"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectCurrents = exports.createProjectCurrent = void 0;
// src/services/projectCurrent.service.ts
const data_source_1 = require("../config/data-source");
const ProjectCurrent_1 = require("../entities/ProjectCurrent");
const CompanyProject_1 = require("../entities/CompanyProject");
const CompanyBalance_1 = require("../entities/CompanyBalance");
const projectCurrentRepo = data_source_1.AppDataSource.getRepository(ProjectCurrent_1.ProjectCurrent);
const projectRepo = data_source_1.AppDataSource.getRepository(CompanyProject_1.CompanyProject);
const balanceRepo = data_source_1.AppDataSource.getRepository(CompanyBalance_1.CompanyBalance);
const createProjectCurrent = async (data, currentUser) => {
    // 1. Project kontrolü
    const project = await projectRepo.findOneByOrFail({ id: data.projectId });
    // 2. Balance kontrolü (code ile arıyoruz!)
    const balance = await balanceRepo.findOneByOrFail({ code: data.balanceCode.trim().toUpperCase() });
    // 3. Yeni kayıt oluştur
    const newRecord = projectCurrentRepo.create({
        project: { id: project.id },
        balance: { id: balance.id },
        type: data.type.trim(),
        amount: data.amount,
        currency: data.currency.trim().toUpperCase(),
        transactionDate: data.transactionDate?.trim(),
        description: data.description.trim(),
        createdBy: { id: currentUser.userId },
        updatedBy: { id: currentUser.userId },
    });
    // CompanyBalance güncellemesi:
    if (data.type.trim() === "Ödeme") {
        balance.amount = Number(balance.amount) - data.amount;
    }
    else if (data.type.trim() === "Tahsilat") {
        balance.amount = Number(balance.amount) + data.amount;
    }
    else {
        throw new Error("Geçersiz işlem tipi (sadece 'Ödeme' veya 'Tahsilat' olabilir).");
    }
    // Transaction gibi ilerle
    await balanceRepo.save(balance);
    // 4. Kaydet ve return et
    return await projectCurrentRepo.save(newRecord);
};
exports.createProjectCurrent = createProjectCurrent;
const getProjectCurrents = async (projectId) => {
    const currents = await projectCurrentRepo.find({
        where: { project: { id: projectId } },
        relations: ["balance", "createdBy", "updatedBy"],
        order: { createdatetime: "DESC" },
    });
    return currents.map((c) => ({
        id: c.id,
        balanceCode: c.balance.code,
        type: c.type,
        amount: c.amount,
        currency: c.currency,
        transactionDate: c.transactionDate,
        description: c.description,
        createdBy: c.createdBy?.name ?? null,
        updatedBy: c.updatedBy?.name ?? null,
        createdatetime: c.createdatetime,
        updatedatetime: c.updatedatetime,
    }));
};
exports.getProjectCurrents = getProjectCurrents;
