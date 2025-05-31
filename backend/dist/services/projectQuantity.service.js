"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectQuantities = exports.createProjectQuantity = void 0;
const data_source_1 = require("../config/data-source");
const ProjectQuantity_1 = require("../entities/ProjectQuantity");
const CompanyProject_1 = require("../entities/CompanyProject");
const QuantityItem_1 = require("../entities/QuantityItem");
const ProjectSupplier_1 = require("../entities/ProjectSupplier");
const generateCode_1 = require("../utils/generateCode");
const projectQuantityRepo = data_source_1.AppDataSource.getRepository(ProjectQuantity_1.ProjectQuantity);
const projectRepo = data_source_1.AppDataSource.getRepository(CompanyProject_1.CompanyProject);
const quantityItemRepo = data_source_1.AppDataSource.getRepository(QuantityItem_1.QuantityItem);
const projectSupplierRepo = data_source_1.AppDataSource.getRepository(ProjectSupplier_1.ProjectSupplier);
const createProjectQuantity = async (data, currentUser, manager = data_source_1.AppDataSource.manager // ✅ default manager
) => {
    const projectRepo = manager.getRepository(CompanyProject_1.CompanyProject);
    const quantityItemRepo = manager.getRepository(QuantityItem_1.QuantityItem);
    const projectQuantityRepo = manager.getRepository(ProjectQuantity_1.ProjectQuantity);
    const projectSupplierRepo = manager.getRepository(ProjectSupplier_1.ProjectSupplier);
    const project = await projectRepo.findOneByOrFail({ id: data.projectId });
    const quantityItem = await quantityItemRepo.findOneByOrFail({
        code: data.quantityItemCode.trim().toUpperCase(),
    });
    const newRecord = projectQuantityRepo.create({
        project: { id: project.id },
        quantityItem: { id: quantityItem.id },
        quantity: data.quantity,
        unit: data.unit.trim(),
        description: data.description?.trim(),
        category: data.category.trim(),
        createdBy: { id: currentUser.userId },
        updatedBy: { id: currentUser.userId },
    });
    const savedQuantity = await projectQuantityRepo.save(newRecord);
    const code = await (0, generateCode_1.generateNextEntityCode)(manager, project.code, data.category, "TED", "ProjectSupplier");
    const autoSupplier = projectSupplierRepo.create({
        code,
        project: { id: data.projectId },
        quantityItem: { id: quantityItem.id },
        projectQuantity: { id: savedQuantity.id },
        addedFromQuantityYN: "Y",
        quantity: data.quantity,
        unit: data.unit.trim(),
        category: data.category.trim(),
        description: `${data.category} metraj hesabından gelen`,
        status: `NEW`,
        createdBy: { id: currentUser.userId },
        updatedBy: { id: currentUser.userId },
    });
    await projectSupplierRepo.save(autoSupplier);
    return savedQuantity;
};
exports.createProjectQuantity = createProjectQuantity;
const getProjectQuantities = async (projectId) => {
    const items = await projectQuantityRepo.find({
        where: { project: { id: projectId } },
        relations: ["quantityItem", "createdBy", "updatedBy"],
        order: { createdatetime: "DESC" },
    });
    return items.map((item) => ({
        id: item.id,
        code: item.code ?? null,
        quantityItemCode: item.quantityItem.code,
        quantityItemName: item.quantityItem.name,
        quantity: item.quantity,
        unit: item.unit,
        description: item.description,
        category: item.category,
        createdBy: item.createdBy?.name ?? null,
        updatedBy: item.updatedBy?.name ?? null,
        createdatetime: item.createdatetime,
        updatedatetime: item.updatedatetime,
    }));
};
exports.getProjectQuantities = getProjectQuantities;
