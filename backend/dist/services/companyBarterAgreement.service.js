"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeBarterAgreement = exports.getCompanyBarterAgreementById = exports.getAllCompanyBarterAgreementsByProjectId = exports.getAllCompanyBarterAgreements = exports.updateCompanyBarterAgreement = exports.createCompanyBarterAgreementFromProject = exports.createCompanyBarterAgreement = void 0;
const data_source_1 = require("../config/data-source");
const CompanyBarterAgreement_1 = require("../entities/CompanyBarterAgreement");
const CompanyProject_1 = require("../entities/CompanyProject");
const generateCode_1 = require("../utils/generateCode");
const processBarterItem_serivce_1 = require("./processBarterItem.serivce");
const createCompanyBarterAgreement = async (data, currentUser, manager = data_source_1.AppDataSource.manager) => {
    const agreementRepo = manager.getRepository(CompanyBarterAgreement_1.CompanyBarterAgreement);
    const projectRepo = manager.getRepository(CompanyProject_1.CompanyProject);
    // ✅ Proje kontrolü
    const project = await projectRepo.findOneOrFail({
        where: {
            code: data.projectCode,
            company: { id: currentUser.companyId },
        },
    });
    const code = await (0, generateCode_1.generateNextEntityCode)(manager, project.code, data.counterpartyType, "BRT", // BARTER
    "CompanyBarterAgreement");
    // ✅ Yeni takas anlaşması nesnesi oluşturuluyor
    const agreement = agreementRepo.create({
        code,
        project: { id: project.id },
        company: { id: currentUser.companyId },
        counterpartyType: data.counterpartyType,
        counterpartyId: data.counterpartyId ?? null,
        counterpartyName: data.counterpartyName,
        agreementDate: data.agreementDate,
        status: data.status,
        description: data.description,
        totalOurValue: data.totalOurValue ?? 0,
        totalTheirValue: data.totalTheirValue ?? 0,
        createdBy: { id: currentUser.userId },
        updatedBy: { id: currentUser.userId },
    });
    return await agreementRepo.save(agreement);
};
exports.createCompanyBarterAgreement = createCompanyBarterAgreement;
const createCompanyBarterAgreementFromProject = async (projectId, // 🔄 Artık data içinde değil, parametre
data, currentUser, manager = data_source_1.AppDataSource.manager) => {
    const agreementRepo = manager.getRepository(CompanyBarterAgreement_1.CompanyBarterAgreement);
    const projectRepo = manager.getRepository(CompanyProject_1.CompanyProject);
    // ✅ Proje kontrolü
    const project = await projectRepo.findOneOrFail({
        where: {
            id: projectId,
            company: { id: currentUser.companyId },
        },
    });
    const code = await (0, generateCode_1.generateNextEntityCode)(manager, project.code, data.counterpartyType, "BRT", // BARTER
    "CompanyBarterAgreement");
    // ✅ Yeni takas anlaşması nesnesi oluşturuluyor
    const agreement = agreementRepo.create({
        code,
        project: { id: project.id },
        company: { id: currentUser.companyId },
        counterpartyType: data.counterpartyType,
        counterpartyId: data.counterpartyId ?? null,
        counterpartyName: data.counterpartyName,
        agreementDate: data.agreementDate,
        status: data.status,
        description: data.description,
        totalOurValue: data.totalOurValue ?? 0,
        totalTheirValue: data.totalTheirValue ?? 0,
        createdBy: { id: currentUser.userId },
        updatedBy: { id: currentUser.userId },
    });
    return await agreementRepo.save(agreement);
};
exports.createCompanyBarterAgreementFromProject = createCompanyBarterAgreementFromProject;
const updateCompanyBarterAgreement = async (id, data, currentUser, manager = data_source_1.AppDataSource.manager) => {
    const repo = manager.getRepository(CompanyBarterAgreement_1.CompanyBarterAgreement);
    const projectRepo = manager.getRepository(CompanyProject_1.CompanyProject);
    const agreement = await repo.findOneOrFail({
        where: { id, company: { id: currentUser.companyId } },
        relations: ["project"],
    });
    // ✅ Proje güncellemesi yapılacaksa kontrol ve atama
    if (data.projectCode) {
        const newProject = await projectRepo.findOneOrFail({
            where: {
                code: data.projectCode,
                company: { id: currentUser.companyId },
            },
        });
        agreement.project = newProject;
    }
    agreement.counterpartyType =
        data.counterpartyType ?? agreement.counterpartyType;
    agreement.counterpartyId = data.counterpartyId ?? agreement.counterpartyId;
    agreement.counterpartyName =
        data.counterpartyName ?? agreement.counterpartyName;
    agreement.agreementDate = data.agreementDate ?? agreement.agreementDate;
    agreement.description = data.description ?? agreement.description;
    agreement.totalOurValue = data.totalOurValue ?? agreement.totalOurValue;
    agreement.totalTheirValue = data.totalTheirValue ?? agreement.totalTheirValue;
    agreement.updatedBy = { id: currentUser.userId };
    const prevStatus = agreement.status;
    const newStatus = data.status ?? prevStatus;
    agreement.status = newStatus;
    if (prevStatus !== "COMPLETED" && newStatus === "COMPLETED") {
        console.log("enterence prevvv");
        await (0, exports.completeBarterAgreement)(id, currentUser);
    }
    return await repo.save(agreement);
};
exports.updateCompanyBarterAgreement = updateCompanyBarterAgreement;
const getAllCompanyBarterAgreements = async (currentUser, manager = data_source_1.AppDataSource.manager) => {
    const repo = manager.getRepository(CompanyBarterAgreement_1.CompanyBarterAgreement);
    const agreements = await repo.find({
        where: { company: { id: currentUser.companyId } },
        order: { createdatetime: "DESC" },
        relations: ["project"],
    });
    return agreements;
};
exports.getAllCompanyBarterAgreements = getAllCompanyBarterAgreements;
const getAllCompanyBarterAgreementsByProjectId = async (projectId, currentUser, manager = data_source_1.AppDataSource.manager) => {
    const repo = manager.getRepository(CompanyBarterAgreement_1.CompanyBarterAgreement);
    const agreements = await repo.find({
        where: {
            project: { id: projectId },
            company: { id: currentUser.companyId },
        },
        order: { createdatetime: "DESC" },
        relations: ["project"],
    });
    return agreements;
};
exports.getAllCompanyBarterAgreementsByProjectId = getAllCompanyBarterAgreementsByProjectId;
const getCompanyBarterAgreementById = async (id, currentUser, manager = data_source_1.AppDataSource.manager) => {
    const repo = manager.getRepository(CompanyBarterAgreement_1.CompanyBarterAgreement);
    const agreement = await repo.findOne({
        where: {
            id,
            company: { id: currentUser.companyId },
        },
        relations: ["project"],
    });
    if (!agreement) {
        throw new Error("Takas anlaşması bulunamadı.");
    }
    return agreement;
};
exports.getCompanyBarterAgreementById = getCompanyBarterAgreementById;
const completeBarterAgreement = async (agreementId, currentUser) => {
    const manager = data_source_1.AppDataSource.manager;
    const agreementRepo = manager.getRepository(CompanyBarterAgreement_1.CompanyBarterAgreement);
    const agreement = await agreementRepo.findOne({
        where: {
            id: agreementId,
            company: { id: currentUser.companyId },
        },
        relations: [
            "items",
            "items.relatedStock",
            "items.relatedSubcontractor",
            "items.relatedSupplier",
        ],
    });
    if (!agreement) {
        throw new Error("Takas anlaşması bulunamadı.");
    }
    for (const item of agreement.items) {
        console.log(agreement.items, " agreement code:", agreement.code);
        console.log("enter 2");
        await (0, processBarterItem_serivce_1.processBarterItem)({
            item,
            agreementCode: agreement.code,
            currentUser,
            manager,
        });
    }
    return agreement;
};
exports.completeBarterAgreement = completeBarterAgreement;
