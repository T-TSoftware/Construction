"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEstimatedCostsByProject = exports.createEstimatedCost = void 0;
const data_source_1 = require("../config/data-source");
const ProjectEstimatedCost_1 = require("../entities/ProjectEstimatedCost");
const CompanyProject_1 = require("../entities/CompanyProject");
const generateCode_1 = require("../utils/generateCode");
const estimatedCostRepo = data_source_1.AppDataSource.getRepository(ProjectEstimatedCost_1.ProjectEstimatedCost);
const projectRepo = data_source_1.AppDataSource.getRepository(CompanyProject_1.CompanyProject);
const createEstimatedCost = async (data, currentUser) => {
    const project = await projectRepo.findOneByOrFail({ id: data.projectId });
    const latest = await estimatedCostRepo
        .createQueryBuilder("cost")
        .where("cost.code LIKE :prefix", {
        prefix: `${project.code}-${data.name.slice(0, 3).toUpperCase()}%`,
    })
        .orderBy("cost.code", "DESC")
        .getOne();
    const code = (0, generateCode_1.generateNextEstimatedCostCode)(latest?.code ?? null, project.code, data.name);
    const totalCost = data.unitPrice * data.quantity;
    const estimatedCost = estimatedCostRepo.create({
        ...data,
        code,
        totalCost,
        project: { id: data.projectId },
        createdBy: { id: currentUser.userId },
        updatedBy: { id: currentUser.userId },
    });
    return await estimatedCostRepo.save(estimatedCost);
};
exports.createEstimatedCost = createEstimatedCost;
const getEstimatedCostsByProject = async (projectId) => {
    const costs = await estimatedCostRepo.find({
        where: { project: { id: projectId } },
        relations: ["createdBy", "updatedBy"],
        order: { createdatetime: "DESC" },
    });
    return costs.map((cost) => ({
        id: cost.id,
        code: cost.code,
        name: cost.name,
        category: cost.category,
        unit: cost.unit,
        unitPrice: cost.unitPrice,
        quantity: cost.quantity,
        totalCost: cost.totalCost,
        description: cost.description,
        createdBy: cost.createdBy?.name ?? null,
        updatedBy: cost.updatedBy?.name ?? null,
        createdatetime: cost.createdatetime,
        updatedatetime: cost.updatedatetime,
    }));
};
exports.getEstimatedCostsByProject = getEstimatedCostsByProject;
