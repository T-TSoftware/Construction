"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProjectSupplier = exports.getProjectSuppliers = exports.createProjectSupplier = void 0;
const data_source_1 = require("../config/data-source");
const ProjectSupplier_1 = require("../entities/ProjectSupplier");
const CompanyProject_1 = require("../entities/CompanyProject");
const generateCode_1 = require("../utils/generateCode");
const QuantityItem_1 = require("../entities/QuantityItem");
const supplierRepo = data_source_1.AppDataSource.getRepository(ProjectSupplier_1.ProjectSupplier);
const projectRepo = data_source_1.AppDataSource.getRepository(CompanyProject_1.CompanyProject);
const quantityItemRepo = data_source_1.AppDataSource.getRepository(QuantityItem_1.QuantityItem);
const createProjectSupplier = async (data, currentUser, manager = data_source_1.AppDataSource.manager // ✅ default manager
) => {
    const supplierRepo = manager.getRepository(ProjectSupplier_1.ProjectSupplier);
    const projectRepo = manager.getRepository(CompanyProject_1.CompanyProject);
    const quantityItemRepo = manager.getRepository(QuantityItem_1.QuantityItem);
    const project = await projectRepo.findOneByOrFail({ id: data.projectId });
    const quantityItem = await quantityItemRepo.findOneByOrFail({
        code: data.quantityItemCode.trim().toUpperCase(),
    });
    const code = await (0, generateCode_1.generateNextEntityCode)(manager, project.code, data.category, "TED", "ProjectSupplier");
    const remainingAmount = typeof data.contractAmount === "number" &&
        typeof data.paidAmount === "number"
        ? data.contractAmount - data.paidAmount
        : undefined;
    const supplier = supplierRepo.create({
        ...data,
        code,
        quantityItem: { id: quantityItem.id },
        remainingAmount,
        project: { id: data.projectId },
        createdBy: { id: currentUser.userId },
        updatedBy: { id: currentUser.userId },
    });
    return await supplierRepo.save(supplier);
};
exports.createProjectSupplier = createProjectSupplier;
const getProjectSuppliers = async (projectId) => {
    const suppliers = await supplierRepo.find({
        where: { project: { id: projectId } },
        relations: ["createdBy", "updatedBy", "quantityItem"],
        order: { createdatetime: "DESC" },
    });
    return suppliers.map((s) => ({
        code: s.code,
        category: s.category,
        quantityItemCode: s.quantityItem.code,
        //quantityItem: s.quantityItem?.code ?? null,
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
exports.getProjectSuppliers = getProjectSuppliers;
const updateProjectSupplier = async (projectId, code, data, currentUser, manager = data_source_1.AppDataSource.manager // ✅ default olarak global manager
) => {
    const supplierRepo = manager.getRepository(ProjectSupplier_1.ProjectSupplier);
    const supplier = await supplierRepo.findOne({
        where: {
            code,
            project: { id: projectId },
        },
        relations: ["project"],
    });
    if (!supplier) {
        throw new Error("Tedarikçi bulunamadı.");
    }
    // Yeni alanlar set ediliyor
    /*if (data.quantityItemCode) {
      const item = await quantityItemRepo.findOneByOrFail({
        code: data.quantityItemCode.trim().toUpperCase(),
      });
      supplier.quantityItem = item;
    }*/
    supplier.companyName = data.companyName ?? supplier.companyName;
    supplier.unit = data.unit ?? supplier.unit;
    supplier.unitPrice = data.unitPrice ?? supplier.unitPrice;
    supplier.quantity = data.quantity ?? supplier.quantity;
    if (Object.prototype.hasOwnProperty.call(data, "contractAmount")) {
        supplier.contractAmount = data.contractAmount;
    }
    if (Object.prototype.hasOwnProperty.call(data, "paidAmount")) {
        supplier.paidAmount = data.paidAmount;
    }
    //supplier.contractAmount = data.contractAmount ?? supplier.contractAmount;
    //supplier.paidAmount = data.paidAmount ?? supplier.paidAmount;
    supplier.status = data.status ?? supplier.status;
    supplier.description = data.description ?? supplier.description;
    if (supplier.contractAmount !== undefined &&
        supplier.paidAmount !== undefined) {
        const contract = Number(supplier.contractAmount);
        const paid = Number(supplier.paidAmount);
        supplier.remainingAmount = contract - paid;
    }
    else {
        supplier.remainingAmount = null;
    }
    supplier.updatedBy = { id: currentUser.userId };
    supplier.updatedatetime = new Date();
    return await supplierRepo.save(supplier);
};
exports.updateProjectSupplier = updateProjectSupplier;
