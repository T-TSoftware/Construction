"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectQuantities = exports.createProjectQuantity = void 0;
const data_source_1 = require("../config/data-source");
const ProjectQuantity_1 = require("../entities/ProjectQuantity");
const CompanyProject_1 = require("../entities/CompanyProject");
const QuantityItem_1 = require("../entities/QuantityItem");
const ProjectSupplier_1 = require("../entities/ProjectSupplier");
const generateCode_1 = require("../utils/generateCode");
const ProjectSubcontractor_1 = require("../entities/ProjectSubcontractor");
const errorHandler_1 = require("../utils/errorHandler");
const projectQuantityRepo = data_source_1.AppDataSource.getRepository(ProjectQuantity_1.ProjectQuantity);
const projectRepo = data_source_1.AppDataSource.getRepository(CompanyProject_1.CompanyProject);
const quantityItemRepo = data_source_1.AppDataSource.getRepository(QuantityItem_1.QuantityItem);
const projectSupplierRepo = data_source_1.AppDataSource.getRepository(ProjectSupplier_1.ProjectSupplier);
const createProjectQuantity = async (data, currentUser, manager = data_source_1.AppDataSource.manager) => {
    const projectRepo = manager.getRepository(CompanyProject_1.CompanyProject);
    const quantityItemRepo = manager.getRepository(QuantityItem_1.QuantityItem);
    const projectQuantityRepo = manager.getRepository(ProjectQuantity_1.ProjectQuantity);
    const projectSupplierRepo = manager.getRepository(ProjectSupplier_1.ProjectSupplier);
    const projectSubcontractorRepo = manager.getRepository(ProjectSubcontractor_1.ProjectSubcontractor);
    // ✅ Şirket doğrulaması
    const project = await projectRepo.findOneByOrFail({
        id: data.projectId,
        company: { id: currentUser.companyId },
    });
    const quantityItem = data.quantityItemCode
        ? await projectRepo.findOneByOrFail({ code: data.quantityItemCode })
        : null;
    // ✅ Yeni metraj kaydı oluşturuluyor
    const newRecord = projectQuantityRepo.create({
        project: { id: project.id },
        quantityItem: quantityItem ? { id: quantityItem.id } : null,
        quantity: data.quantity,
        unit: data.unit.trim().toUpperCase(),
        description: data.description?.trim(),
        category: data.category.trim(),
        company: { id: currentUser.companyId }, // ✅ companyId atanıyor
        createdBy: { id: currentUser.userId },
        updatedBy: { id: currentUser.userId },
    });
    const savedQuantity = await projectQuantityRepo.save(newRecord);
    /*
    // Eğer supplier tarafı otomatik oluşturulursa bu kısım da açılabilir
    const supplierCode = await generateNextEntityCode(
      manager,
      project.code,
      data.category,
      "TED",
      "ProjectSupplier"
    );
  
    const autoSupplier = projectSupplierRepo.create({
      code: supplierCode,
      project: { id: data.projectId },
      quantityItem: { id: quantityItem.id },
      projectQuantity: { id: savedQuantity.id },
      addedFromQuantityYN: "Y",
      quantity: data.quantity,
      unit: data.unit.trim(),
      category: data.category.trim(),
      description: `${data.category} metraj hesabından gelen`,
      status: `NEW`,
      company: { id: currentUser.companyId }, // ✅ company set
      createdBy: { id: currentUser.userId },
      updatedBy: { id: currentUser.userId },
    });
  
    await projectSupplierRepo.save(autoSupplier);
    */
    // ✅ Otomatik taşeron kaydı oluşturuluyor
    const subcontractorCode = await (0, generateCode_1.generateNextEntityCode)(manager, project.code, data.category, "TAS", "ProjectSubcontractor");
    const autoSubcontractor = projectSubcontractorRepo.create({
        code: subcontractorCode,
        project: { id: data.projectId },
        quantityItem: quantityItem ? { id: quantityItem.id } : null,
        projectQuantity: { id: savedQuantity.id },
        locked: true,
        addedFromQuantityYN: "Y",
        quantity: data.quantity,
        unit: data.unit.trim(),
        category: data.category.trim(),
        description: `${data.category} metraj hesabından gelen`,
        status: `NEW`,
        company: { id: currentUser.companyId }, // ✅ companyId atanıyor
        createdBy: { id: currentUser.userId },
        updatedBy: { id: currentUser.userId },
    });
    //await projectSubcontractorRepo.save(autoSubcontractor);
    await (0, errorHandler_1.handleSaveWithUniqueConstraint)(() => projectSubcontractorRepo.save(autoSubcontractor), "ProjectSubcontractor");
    return savedQuantity;
};
exports.createProjectQuantity = createProjectQuantity;
const getProjectQuantities = async (projectId, currentUser // ✅ companyId alındı
) => {
    const items = await projectQuantityRepo.find({
        where: {
            project: { id: projectId },
            company: { id: currentUser.companyId }, // ✅ sadece kullanıcının şirketine ait kayıtlar
        },
        relations: ["quantityItem", "createdBy", "updatedBy"],
        order: { createdatetime: "DESC" },
    });
    return items.map((item) => ({
        id: item.id,
        code: item.code ?? null,
        quantityItemCode: item.quantityItem?.code,
        quantityItemName: item.quantityItem?.name,
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
