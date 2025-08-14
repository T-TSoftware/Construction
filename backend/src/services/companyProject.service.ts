import { AppDataSource } from "../config/data-source";
import { CompanyProject } from "../entities/CompanyProject";
import { Company } from "../entities/Company";
import { generateNextProjectCode } from "../utils/generateCode";

const projectRepo = AppDataSource.getRepository(CompanyProject);
const companyRepo = AppDataSource.getRepository(Company);

export const createProject = async (
  data: {
    name: string;
    site: string;
    status?: string;
    estimatedStartDate: Date;
    actualStartDate?: Date;
    estimatedEndDate: Date;
    actualEndDate?: Date;
  },
  currentUser: {
    userId: string;
    companyId: string;
  }
) => {
  const company = await companyRepo.findOneByOrFail({
    id: currentUser.companyId,
  });

  //const projectName = data.name.trim().replace(/\s+/g, "").toUpperCase();
  const code = `${company.code}-${data.name}`;

  const project = projectRepo.create({
    ...data,
    code,
    company: { id: company.id },
    createdBy: { id: currentUser.userId },
    updatedBy: { id: currentUser.userId },
  });

  return await projectRepo.save(project);
};

export const getCompanyProjects = async (companyId: string) => {
  const projects = await projectRepo.find({
    where: { company: { id: companyId } },
    relations: ["createdBy", "updatedBy"],
    order: { createdatetime: "DESC" },
  });

  return projects.map((project) => ({
    id: project.id,
    code: project.code,
    name: project.name,
    site: project.site,
    status: project.status,
    estimatedStartDate: project.estimatedStartDate,
    actualStartDate: project.actualStartDate,
    estimatedEndDate: project.estimatedEndDate,
    actualEndDate: project.actualEndDate,
    createdBy: project.createdBy?.name ?? null,
    updatedBy: project.updatedBy?.name ?? null,
    createdatetime: project.createdatetime,
    updatedatetime: project.updatedatetime,
  }));
};

export const getProjectById = async (id: string, companyId: string) => {
  const project = await projectRepo.findOne({
    where: {
      id,
      company: { id: companyId },
    },
    relations: ["createdBy", "updatedBy"],
  });

  if (!project) {
    throw new Error("Proje bulunamadı.");
  }

  return {
    code: project.code,
    name: project.name,
    site: project.site,
    status: project.status,
    estimatedStartDate: project.estimatedStartDate,
    actualStartDate: project.actualStartDate,
    estimatedEndDate: project.estimatedEndDate,
    actualEndDate: project.actualEndDate,
    createdBy: project.createdBy?.name ?? null,
    updatedBy: project.updatedBy?.name ?? null,
    createdatetime: project.createdatetime,
    updatedatetime: project.updatedatetime,
  };
};
