import { AppDataSource } from "../config/data-source";
import { ProjectQuantity } from "../entities/ProjectQuantity";
import { CompanyProject } from "../entities/CompanyProject";
import { QuantityItem } from "../entities/QuantityItem";
import { ProjectSupplier } from "../entities/ProjectSupplier";
import { generateNextEntityCode } from "../utils/generateCode";

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
  }
): Promise<ProjectQuantity> => {
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

  const prefix = `${project.code.split("-")[1]}-TED-${data.category
    .slice(0, 3)
    .toUpperCase()}`;

  // En son kodu bul
  const latest = await projectSupplierRepo
    .createQueryBuilder("supplier")
    .where("supplier.code LIKE :prefix", { prefix: `${prefix}%` })
    .orderBy("supplier.code", "DESC")
    .getOne();

  // Yeni kodu üret
  const code = generateNextEntityCode(
    latest?.code ?? null,
    project.code,
    data.category,
    "TED"
  );

  const autoSupplier = projectSupplierRepo.create({
    code,
    project: { id: data.projectId },
    quantityItem: { id: quantityItem.id },
    projectQuantity: { id: savedQuantity.id },
    addedFromQuantityYN: "Y",
    quantity: data.quantity,
    unit: data.unit.trim(),
    category: data.category.trim(),
    description: `${data.category} metraj hesabindan gelen`,
    status: `NEW`,
    createdBy: { id: currentUser.userId },
    updatedBy: { id: currentUser.userId },
  });

  await projectSupplierRepo.save(autoSupplier);

  return savedQuantity;
};

export const getProjectQuantities = async (projectId: string) => {
  const items = await projectQuantityRepo.find({
    where: { project: { id: projectId } },
    relations: ["quantityItem", "createdBy", "updatedBy"],
    order: { createdatetime: "DESC" },
  });

  return items.map((item) => ({
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
