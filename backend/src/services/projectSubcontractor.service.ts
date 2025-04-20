import { AppDataSource } from "../config/data-source";
import { ProjectSubcontractor } from "../entities/ProjectSubcontractor";
import { CompanyProject } from "../entities/CompanyProject";
import { generateNextEntityCode } from "../utils/generateCode";

const subcontractorRepo = AppDataSource.getRepository(ProjectSubcontractor);
const projectRepo = AppDataSource.getRepository(CompanyProject);

export const createProjectSubcontractor = async (
  data: {
    projectId: string;
    category: string;
    companyName?: string;
    unit: string;
    unitPrice?: number;
    quantity?: number;
    contractAmount?: number;
    paidAmount?: number;
    status: string;
    description?: string;
  },
  currentUser: {
    userId: string;
  }
) => {
  const project = await projectRepo.findOneByOrFail({ id: data.projectId });

  const prefix = `${project.code.split("-")[1]}-TAS-${data.category
    .slice(0, 3)
    .toUpperCase()}`;

  const latest = await subcontractorRepo
    .createQueryBuilder("subcontractor")
    .where("subcontractor.code LIKE :prefix", { prefix: `${prefix}%` })
    .orderBy("subcontractor.code", "DESC")
    .getOne();

  const code = generateNextEntityCode(
    latest?.code ?? null,
    project.code,
    data.category,
    "TAS"
  );

  const remainingAmount =
    typeof data.contractAmount === "number" &&
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

export const getProjectSubcontractors = async (projectId: string) => {
  const subcontractors = await subcontractorRepo.find({
    where: { project: { id: projectId } },
    relations: ["createdBy", "updatedBy"],
    order: { createdatetime: "DESC" },
  });

  return subcontractors.map((s) => ({
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

export const updateProjectSubcontractor = async (
  projectId: string,
  code: string,
  data: {
    companyName?: string;
    unit?: string;
    unitPrice?: number;
    quantity?: number;
    contractAmount?: number;
    paidAmount?: number;
    status?: string;
    description?: string;
  },
  currentUser: {
    userId: string;
  }
) => {
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
    subcontractor.contractAmount = data.contractAmount!;
  }
  if (Object.prototype.hasOwnProperty.call(data, "paidAmount")) {
    subcontractor.paidAmount = data.paidAmount!;
  }
  //subcontractor.contractAmount = data.contractAmount ?? subcontractor.contractAmount;
  //subcontractor.paidAmount = data.paidAmount ?? subcontractor.paidAmount;
  subcontractor.status = data.status ?? subcontractor.status;
  subcontractor.description = data.description ?? subcontractor.description;

  if (
    subcontractor.contractAmount !== undefined &&
    subcontractor.paidAmount !== undefined
  ) {
    const contract = Number(subcontractor.contractAmount);
    const paid = Number(subcontractor.paidAmount);
    subcontractor.remainingAmount = contract - paid;
  } else {
    subcontractor.remainingAmount = null;
  }

  subcontractor.updatedBy = { id: currentUser.userId } as any;
  subcontractor.updatedatetime = new Date();

  return await subcontractorRepo.save(subcontractor);
};
