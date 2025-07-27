import { AppDataSource } from "../config/data-source";
import { ProjectEstimatedCost } from "../entities/ProjectEstimatedCost";
import { CompanyProject } from "../entities/CompanyProject";
import { generateNextEstimatedCostCode } from "../utils/generateCode";

const estimatedCostRepo = AppDataSource.getRepository(ProjectEstimatedCost);
const projectRepo = AppDataSource.getRepository(CompanyProject);

export const createEstimatedCost = async (
  data: {
    projectId: string;
    name: string;
    category: string;
    description?: string;
    unit: string;
    unitPrice: number;
    quantity: number;
  },
  currentUser: {
    userId: string;
    companyId: string; // ✅ companyId eklendi
  }
) => {
  const project = await projectRepo.findOneByOrFail({ id: data.projectId });

  const latest = await estimatedCostRepo
    .createQueryBuilder("cost")
    .where("cost.code LIKE :prefix", {
      prefix: `${project.code}-${data.name.slice(0, 3).toUpperCase()}%`,
    })
    .andWhere("cost.companyid = :companyId", {
      companyId: currentUser.companyId,
    }) // ✅ şirket filtresi eklendi
    .orderBy("cost.code", "DESC")
    .getOne();

  const code = generateNextEstimatedCostCode(
    latest?.code ?? null,
    project.code,
    data.name
  );

  const totalCost = data.unitPrice * data.quantity;

  const estimatedCost = estimatedCostRepo.create({
    ...data,
    code,
    totalCost,
    project: { id: data.projectId },
    company: { id: currentUser.companyId }, // ✅ company set edildi
    createdBy: { id: currentUser.userId },
    updatedBy: { id: currentUser.userId },
  });

  return await estimatedCostRepo.save(estimatedCost);
};

export const getEstimatedCostsByProject = async (
  projectId: string,
  currentUser: { userId: string; companyId: string } // ✅ companyId alındı
) => {
  const costs = await estimatedCostRepo.find({
    where: {
      project: { id: projectId },
      company: { id: currentUser.companyId }, // ✅ companyId üzerinden filtreleme
    },
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
