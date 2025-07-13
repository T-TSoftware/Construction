"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProjectSubcontractor = exports.getProjectSubcontractors = exports.createProjectSubcontractor = void 0;
const data_source_1 = require("../config/data-source");
const ProjectSubcontractor_1 = require("../entities/ProjectSubcontractor");
const CompanyProject_1 = require("../entities/CompanyProject");
const generateCode_1 = require("../utils/generateCode");
const subcontractorRepo = data_source_1.AppDataSource.getRepository(ProjectSubcontractor_1.ProjectSubcontractor);
const projectRepo = data_source_1.AppDataSource.getRepository(CompanyProject_1.CompanyProject);
const createProjectSubcontractor = async (data, currentUser, manager = data_source_1.AppDataSource.manager // ✅ default olarak global manager
) => {
    const subcontractorRepo = manager.getRepository(ProjectSubcontractor_1.ProjectSubcontractor);
    const projectRepo = manager.getRepository(CompanyProject_1.CompanyProject);
    const project = await projectRepo.findOneByOrFail({ id: data.projectId });
    const code = await (0, generateCode_1.generateNextEntityCode)(manager, project.code, data.category, "TAS", // 🔧 Taşeron tipi kodu
    "ProjectSubcontractor");
    const remainingAmount = typeof data.contractAmount === "number" &&
        typeof data.paidAmount === "number"
        ? data.contractAmount - data.paidAmount
        : undefined;
    const subcontractor = subcontractorRepo.create({
        ...data,
        code,
        remainingAmount,
        project: { id: data.projectId },
        createdBy: { id: currentUser.userId },
        updatedBy: { id: currentUser.userId },
    });
    return await subcontractorRepo.save(subcontractor);
};
exports.createProjectSubcontractor = createProjectSubcontractor;
const getProjectSubcontractors = async (projectId) => {
    const subcontractors = await subcontractorRepo.find({
        where: { project: { id: projectId } },
        relations: ["createdBy", "updatedBy"],
        order: { createdatetime: "DESC" },
    });
    return subcontractors.map((s) => ({
        id: s.id,
        code: s.code,
        category: s.category,
        companyName: s.companyName,
        unit: s.unit,
        unitPrice: s.unitPrice,
        quantity: s.quantity,
        contractAmount: s.contractAmount,
        paidAmount: s.paidAmount,
        remainingAmount: s.remainingAmount,
        status: s.status,
        description: s.description,
        createdBy: s.createdBy?.name ?? null,
        updatedBy: s.updatedBy?.name ?? null,
        createdatetime: s.createdatetime,
        updatedatetime: s.updatedatetime,
    }));
};
exports.getProjectSubcontractors = getProjectSubcontractors;
const updateProjectSubcontractor = async (projectId, code, data, currentUser) => {
    const subcontractor = await subcontractorRepo.findOne({
        where: {
            code,
            project: { id: projectId },
        },
        relations: ["project"],
    });
    if (!subcontractor) {
        throw new Error("Tedarikçi bulunamadı.");
    }
    // Yeni alanlar set ediliyor
    subcontractor.companyName = data.companyName ?? subcontractor.companyName;
    subcontractor.unit = data.unit ?? subcontractor.unit;
    subcontractor.unitPrice = data.unitPrice ?? subcontractor.unitPrice;
    subcontractor.quantity = data.quantity ?? subcontractor.quantity;
    if (Object.prototype.hasOwnProperty.call(data, "contractAmount")) {
        subcontractor.contractAmount = data.contractAmount;
    }
    if (Object.prototype.hasOwnProperty.call(data, "paidAmount")) {
        subcontractor.paidAmount = data.paidAmount;
    }
    //subcontractor.contractAmount = data.contractAmount ?? subcontractor.contractAmount;
    //subcontractor.paidAmount = data.paidAmount ?? subcontractor.paidAmount;
    subcontractor.status = data.status ?? subcontractor.status;
    subcontractor.description = data.description ?? subcontractor.description;
    if (subcontractor.contractAmount !== undefined &&
        subcontractor.paidAmount !== undefined) {
        const contract = Number(subcontractor.contractAmount);
        const paid = Number(subcontractor.paidAmount);
        subcontractor.remainingAmount = contract - paid;
    }
    else {
        subcontractor.remainingAmount = null;
    }
    subcontractor.updatedBy = { id: currentUser.userId };
    subcontractor.updatedatetime = new Date();
    return await subcontractorRepo.save(subcontractor);
};
exports.updateProjectSubcontractor = updateProjectSubcontractor;
