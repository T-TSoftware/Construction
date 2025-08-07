import { AppDataSource } from "../config/data-source";
import { EntityManager } from "typeorm";
import { ProjectQuantity } from "../entities/ProjectQuantity";
import { CompanyProject } from "../entities/CompanyProject";
import { QuantityItem } from "../entities/QuantityItem";
import { ProjectSupplier } from "../entities/ProjectSupplier";
import { generateNextEntityCode } from "../utils/generateCode";
import { ProjectSubcontractor } from "../entities/ProjectSubcontractor";
import { handleSaveWithUniqueConstraint } from "../utils/errorHandler";

const projectQuantityRepo = AppDataSource.getRepository(ProjectQuantity);
const projectRepo = AppDataSource.getRepository(CompanyProject);
const quantityItemRepo = AppDataSource.getRepository(QuantityItem);
const projectSupplierRepo = AppDataSource.getRepository(ProjectSupplier);

export const createProjectQuantity = async (
  data: {
    projectId: string;
    quantityItemCode: string;
    quantity: number;
    unit: string;
    description?: string;
    category: string;
  },
  currentUser: {
    userId: string;
    companyId: string; // ✅ companyId alındı
  },
  manager: EntityManager = AppDataSource.manager
): Promise<ProjectQuantity> => {
  const projectRepo = manager.getRepository(CompanyProject);
  const quantityItemRepo = manager.getRepository(QuantityItem);
  const projectQuantityRepo = manager.getRepository(ProjectQuantity);
  const projectSupplierRepo = manager.getRepository(ProjectSupplier);
  const projectSubcontractorRepo = manager.getRepository(ProjectSubcontractor);

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
    unit: data.unit.trim(),
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
  const subcontractorCode = await generateNextEntityCode(
    manager,
    project.code,
    data.category,
    "TAS",
    "ProjectSubcontractor"
  );

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

  await handleSaveWithUniqueConstraint(
    () => projectSubcontractorRepo.save(autoSubcontractor),
    "ProjectSubcontractor"
  );

  return savedQuantity;
};

export const getProjectQuantities = async (
  projectId: string,
  currentUser: { userId: string; companyId: string } // ✅ companyId alındı
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
