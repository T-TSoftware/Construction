"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeBarterAgreement = exports.getCompanyBarterAgreementById = exports.getAllCompanyBarterAgreementsByProjectId = exports.getAllCompanyBarterAgreements = exports.updateCompanyBarterAgreement = exports.createCompanyBarterAgreementFromProject = exports.createCompanyBarterAgreement = void 0;
const data_source_1 = require("../config/data-source");
const CompanyBarterAgreement_1 = require("../entities/CompanyBarterAgreement");
const CompanyProject_1 = require("../entities/CompanyProject");
const generateCode_1 = require("../utils/generateCode");
const processBarterItem_serivce_1 = require("./processBarterItem.serivce");
const persist_1 = require("../utils/persist");
const sanitizeRules_1 = require("../utils/sanitizeRules");
const sanitize_1 = require("../utils/sanitize");
const createCompanyBarterAgreement = async (data, currentUser, manager = data_source_1.AppDataSource.manager) => {
    const agreementRepo = manager.getRepository(CompanyBarterAgreement_1.CompanyBarterAgreement);
    const projectRepo = manager.getRepository(CompanyProject_1.CompanyProject);
    // ✅ Proje kontrolü
    const project = await projectRepo.findOneOrFail({
        where: {
            id: data.projectId,
            company: { id: currentUser.companyId },
        },
    });
    /*const code = await generateNextBarterCode(manager, {
      companyId: currentUser.companyId,
      projectCode: project.code, // İZM001 gibi
      counterpartyType: data.counterpartyType.toUpperCase(), // SUPPLIER | SUBCONTRACTOR | ...
    });*/
    const code = await (0, generateCode_1.generateEntityCode)(manager, currentUser.companyId, "CompanyBarterAgreement");
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
    //return await agreementRepo.save(agreement);
    return await (0, persist_1.saveRefetchSanitize)({
        entityName: "CompanyBarterAgreement",
        save: () => agreementRepo.save(agreement),
        refetch: () => agreementRepo.findOneOrFail({
            where: { id: agreement.id, company: { id: currentUser.companyId } },
            relations: ["project", "company", "createdBy", "updatedBy"],
        }),
        rules: sanitizeRules_1.sanitizeRules,
        defaultError: "Barter kaydı oluşturulamadı.",
    });
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
    const code = await (0, generateCode_1.generateNextBarterCode)(manager, {
        companyId: currentUser.companyId,
        projectCode: project.code, // İZM001 gibi
        counterpartyType: data.counterpartyType.toUpperCase(), // SUPPLIER | SUBCONTRACTOR | ...
    });
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
    //return await agreementRepo.save(agreement);
    return await (0, persist_1.saveRefetchSanitize)({
        entityName: "CompanyBarterAgreement",
        save: () => agreementRepo.save(agreement),
        refetch: () => agreementRepo.findOneOrFail({
            where: { id: agreement.id, company: { id: currentUser.companyId } },
            relations: ["project", "company", "createdBy", "updatedBy"],
        }),
        rules: sanitizeRules_1.sanitizeRules,
        defaultError: "Barter kaydı oluşturulamadı.",
    });
};
exports.createCompanyBarterAgreementFromProject = createCompanyBarterAgreementFromProject;
const updateCompanyBarterAgreement = async (id, data, currentUser, manager = data_source_1.AppDataSource.manager) => {
    const agreementRepo = manager.getRepository(CompanyBarterAgreement_1.CompanyBarterAgreement);
    const projectRepo = manager.getRepository(CompanyProject_1.CompanyProject);
    const agreement = await agreementRepo.findOneOrFail({
        where: { id, company: { id: currentUser.companyId } },
        relations: ["project", "company", "createdBy", "updatedBy"],
    });
    // Önce mevcut referansları sakla (kodu yeniden üretmeye gerek var mı karar vermek için)
    const prevProjectId = agreement.project?.id ?? null;
    const prevCounterpartyType = agreement.counterpartyType;
    // ✅ Proje güncellemesi yapılacaksa ata
    if (data.projectId && data.projectId !== prevProjectId) {
        const newProject = await projectRepo.findOneOrFail({
            where: { id: data.projectId, company: { id: currentUser.companyId } },
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
    // 🔁 Proje ya da karşı taraf tipi değiştiyse code’u yeniden üret
    const projectChanged = !!data.projectId && data.projectId !== prevProjectId;
    const typeChanged = !!data.counterpartyType && data.counterpartyType !== prevCounterpartyType;
    if (projectChanged || typeChanged) {
        const projectCode = agreement.project?.code; // relation yukarıda güncellendi
        if (!projectCode) {
            throw new Error("Barter kodu üretmek için proje zorunludur.");
        }
        // generateNextBarterCode şirket içinde, aynı proje ve tip kapsamındaki en büyük numarayı +1 yapar
        const newCode = await (0, generateCode_1.generateNextBarterCode)(manager, {
            companyId: currentUser.companyId,
            projectCode, // ör: İZM001
            counterpartyType: agreement.counterpartyType, // "SUPPLIER" | "SUBCONTRACTOR" | ...
        });
        agreement.code = newCode;
    }
    if (prevStatus !== "COMPLETED" && newStatus === "COMPLETED") {
        console.log("enterence prevvv");
        await (0, exports.completeBarterAgreement)(id, currentUser);
    }
    //return await repo.save(agreement);
    return await (0, persist_1.saveRefetchSanitize)({
        entityName: "CompanyBarterAgreement",
        save: () => agreementRepo.save(agreement),
        refetch: () => agreementRepo.findOneOrFail({
            where: { id: agreement.id, company: { id: currentUser.companyId } },
            relations: ["project", "company", "createdBy", "updatedBy"],
        }),
        rules: sanitizeRules_1.sanitizeRules,
        defaultError: "Barter kaydı oluşturulamadı.",
    });
};
exports.updateCompanyBarterAgreement = updateCompanyBarterAgreement;
const getAllCompanyBarterAgreements = async (currentUser, manager = data_source_1.AppDataSource.manager) => {
    const repo = manager.getRepository(CompanyBarterAgreement_1.CompanyBarterAgreement);
    const agreements = await repo.find({
        where: { company: { id: currentUser.companyId } },
        order: { createdatetime: "DESC" },
        relations: ["project", "company", "createdBy", "updatedBy"],
    });
    return (0, sanitize_1.sanitizeEntity)(agreements, "CompanyBarterAgreement", sanitizeRules_1.sanitizeRules);
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
        relations: ["project", "company", "createdBy", "updatedBy"],
    });
    return (0, sanitize_1.sanitizeEntity)(agreements, "CompanyBarterAgreement", sanitizeRules_1.sanitizeRules);
};
exports.getAllCompanyBarterAgreementsByProjectId = getAllCompanyBarterAgreementsByProjectId;
const getCompanyBarterAgreementById = async (id, currentUser, manager = data_source_1.AppDataSource.manager) => {
    const repo = manager.getRepository(CompanyBarterAgreement_1.CompanyBarterAgreement);
    const agreement = await repo.findOne({
        where: {
            id,
            company: { id: currentUser.companyId },
        },
        relations: ["project", "company", "createdBy", "updatedBy"],
    });
    if (!agreement) {
        throw new Error("Takas anlaşması bulunamadı.");
    }
    return (0, sanitize_1.sanitizeEntity)(agreement, "CompanyBarterAgreement", sanitizeRules_1.sanitizeRules);
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
