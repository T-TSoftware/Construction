"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProjectSubcontractorStatusNew = exports.updateProjectSubcontractorStatus = exports.updateProjectSubcontractor = exports.getProjectSubcontractorById = exports.getProjectSubcontractors = exports.createProjectSubcontractor = void 0;
const data_source_1 = require("../config/data-source");
const ProjectSubcontractor_1 = require("../entities/ProjectSubcontractor");
const CompanyProject_1 = require("../entities/CompanyProject");
const generateCode_1 = require("../utils/generateCode");
const ProjectEstimatedCost_1 = require("../entities/ProjectEstimatedCost");
const subcontractorRepo = data_source_1.AppDataSource.getRepository(ProjectSubcontractor_1.ProjectSubcontractor);
const projectRepo = data_source_1.AppDataSource.getRepository(CompanyProject_1.CompanyProject);
const createProjectSubcontractor = async (data, currentUser, manager = data_source_1.AppDataSource.manager) => {
    const subcontractorRepo = manager.getRepository(ProjectSubcontractor_1.ProjectSubcontractor);
    const projectRepo = manager.getRepository(CompanyProject_1.CompanyProject);
    // 🔍 Şirket kontrolüyle birlikte projeyi getir
    const project = await projectRepo.findOneOrFail({
        where: {
            id: data.projectId,
            company: { id: currentUser.companyId },
        },
    });
    const code = await (0, generateCode_1.generateNextEntityCode)(manager, project.code, data.category, "TAS", // Taşeron tipi kod
    "ProjectSubcontractor");
    const normalizedCategory = data.category.trim().toUpperCase();
    const normalizedUnit = data.unit.trim().toUpperCase();
    const subcontractor = subcontractorRepo.create({
        ...data,
        category: normalizedCategory,
        unit: normalizedUnit,
        code,
        remainingAmount: data.contractAmount,
        project: { id: project.id },
        company: { id: currentUser.companyId },
        createdBy: { id: currentUser.userId },
        updatedBy: { id: currentUser.userId },
    });
    return await subcontractorRepo.save(subcontractor);
};
exports.createProjectSubcontractor = createProjectSubcontractor;
const getProjectSubcontractors = async (projectId, companyId) => {
    const subcontractors = await subcontractorRepo.find({
        where: {
            project: { id: projectId },
            company: { id: companyId },
        },
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
const getProjectSubcontractorById = async (id, currentUser) => {
    const subcontractor = await subcontractorRepo.findOne({
        where: {
            id,
            company: { id: currentUser.companyId },
        },
        relations: ["createdBy", "updatedBy", "project", "projectQuantity"],
    });
    return subcontractor;
};
exports.getProjectSubcontractorById = getProjectSubcontractorById;
const updateProjectSubcontractor = async (id, data, currentUser, manager = data_source_1.AppDataSource.manager) => {
    const subcontractorRepo = manager.getRepository(ProjectSubcontractor_1.ProjectSubcontractor);
    const estimatedCostRepo = manager.getRepository(ProjectEstimatedCost_1.ProjectEstimatedCost);
    const subcontractor = await subcontractorRepo.findOne({
        where: {
            id,
            company: { id: currentUser.companyId },
        },
        relations: ["project", "company", "projectQuantity"], // ✅ Ek ilişkiler AGREED kısmı için
    });
    if (!subcontractor) {
        throw new Error("Taşeron bulunamadı.");
    }
    const isLocked = subcontractor.locked === true;
    // 🔐 Eğer taşeron locked ise sadece unitPrice ve status güncellenebilir
    if (isLocked) {
        subcontractor.unitPrice = data.unitPrice ?? subcontractor.unitPrice;
        subcontractor.status = data.status ?? subcontractor.status;
        subcontractor.companyName = data.companyName ?? subcontractor.companyName;
        if (Object.prototype.hasOwnProperty.call(data, "contractAmount")) {
            subcontractor.contractAmount = data.contractAmount;
            subcontractor.remainingAmount = Number(data.contractAmount ?? 0) - Number(subcontractor.paidAmount ?? 0);
        }
    }
    else {
        // 🔧 Güncellenebilir alanlar (locked değilse)
        subcontractor.unit = data.unit ?? subcontractor.unit;
        subcontractor.unitPrice = data.unitPrice ?? subcontractor.unitPrice;
        subcontractor.quantity = data.quantity ?? subcontractor.quantity;
        subcontractor.companyName = data.companyName ?? subcontractor.companyName;
        subcontractor.description = data.description ?? subcontractor.description;
        subcontractor.status = data.status ?? subcontractor.status;
        subcontractor.category = data.category ?? subcontractor.category;
        if (Object.prototype.hasOwnProperty.call(data, "contractAmount")) {
            subcontractor.contractAmount = data.contractAmount;
            subcontractor.remainingAmount = Number(data.contractAmount ?? 0) - Number(subcontractor.paidAmount ?? 0);
        }
    }
    subcontractor.updatedBy = { id: currentUser.userId };
    subcontractor.updatedatetime = new Date();
    const saved = await subcontractorRepo.save(subcontractor);
    // ✅ AGREED durumunda tahmini maliyet oluştur
    /*if (data.status === "AGREED") {
      const existingEstimate = await estimatedCostRepo.findOne({
        where: {
          project: { id: projectId },
          company: { id: currentUser.companyId },
          sourceType: "SUBCONTRACTOR",
          referenceCode: subcontractor.code, // ✅ aynı referans kodla 1 kere oluşturulmuş mu
        },
      });
  
      if (!existingEstimate) {
        const isAutoGenerated = subcontractor.addedFromQuantityYN === "Y";
  
        const projectQuantityText =
          subcontractor.projectQuantity?.code && subcontractor.quantityItem?.name
            ? `${subcontractor.projectQuantity.code} - ${subcontractor.quantityItem.name}`
            : "manuel giriş";
  
        const estimatedCost = estimatedCostRepo.create({
          project: { id: projectId },
          company: { id: currentUser.companyId },
          unitPrice: subcontractor.unitPrice ?? 0,
          unit: subcontractor.unit,
          quantity: subcontractor.quantity,
          totalCost: subcontractor.contractAmount,
          sourceType: "SUBCONTRACTOR",
          referenceCode: subcontractor.code,
          category: subcontractor.category,
          name: isAutoGenerated
            ? `${subcontractor.companyName} • ${projectQuantityText} için otomatik taşeron`
            : `${subcontractor.companyName} • manuel taşeron`,
          description: isAutoGenerated
            ? `Metraj (${projectQuantityText}) kalemi için taşerondan otomatik oluşturuldu.`
            : `Taşeron kaydı manuel olarak girildi. Metraj bağlantısı bulunmamaktadır.`,
          createdBy: { id: currentUser.userId },
          updatedBy: { id: currentUser.userId },
        });
  
        await estimatedCostRepo.save(estimatedCost);
      }
    }*/
    return saved;
};
exports.updateProjectSubcontractor = updateProjectSubcontractor;
const updateProjectSubcontractorStatus = async (subcontractorCode, amountReceived, currentUser, manager) => {
    const subcontractorRepo = manager.getRepository(ProjectSubcontractor_1.ProjectSubcontractor);
    const subcontractor = await subcontractorRepo.findOneOrFail({
        where: {
            code: subcontractorCode,
            company: { id: currentUser.companyId },
        },
    });
    subcontractor.paidAmount =
        Number(subcontractor.paidAmount ?? 0) + amountReceived;
    subcontractor.remainingAmount =
        Number(subcontractor.contractAmount) - subcontractor.paidAmount;
    subcontractor.status =
        subcontractor.remainingAmount <= 0 ? "PAID" : "PARTIAL";
    //order.updatedatetime = new Date();
    subcontractor.updatedBy = { id: currentUser.userId };
    return await subcontractorRepo.save(subcontractor);
};
exports.updateProjectSubcontractorStatus = updateProjectSubcontractorStatus;
const updateProjectSubcontractorStatusNew = async (subcontractorCode, amount, currentUser, manager, isReverse = false) => {
    const subcontractorRepo = manager.getRepository(ProjectSubcontractor_1.ProjectSubcontractor);
    const subcontractor = await subcontractorRepo.findOneOrFail({
        where: {
            code: subcontractorCode,
            company: { id: currentUser.companyId },
        },
    });
    const factor = isReverse ? -1 : 1;
    // ✅ increment/decrement ile ödeme durumu güncelle
    await subcontractorRepo.increment({ id: subcontractor.id }, "paidAmount", factor * amount);
    // Mevcut güncel subcontractor'ı yeniden al (paidAmount güncellendi)
    const updatedSubcontractor = await subcontractorRepo.findOneOrFail({
        where: { id: subcontractor.id },
    });
    // ✅ remainingAmount ve status hesapla
    const remainingAmount = Number(updatedSubcontractor.contractAmount) -
        Number(updatedSubcontractor.paidAmount);
    const status = remainingAmount <= 0 ? "PAID" : "PARTIAL";
    // Güncelleme
    updatedSubcontractor.remainingAmount = remainingAmount;
    updatedSubcontractor.status = status;
    updatedSubcontractor.updatedBy = { id: currentUser.userId };
    updatedSubcontractor.updatedatetime = new Date();
    // Kaydet
    return await subcontractorRepo.save(updatedSubcontractor);
};
exports.updateProjectSubcontractorStatusNew = updateProjectSubcontractorStatusNew;
