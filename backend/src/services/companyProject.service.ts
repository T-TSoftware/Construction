import { AppDataSource } from "../config/data-source";
import { CompanyProject } from "../entities/CompanyProject";
import { Company } from "../entities/Company";
import { generateNextProjectCode } from "../utils/generateCode";
import { saveRefetchSanitize } from "../utils/persist";
import { sanitizeRules } from "../utils/sanitizeRules";
import { sanitizeEntity } from "../utils/sanitize";

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

  const projectName = data.name.trim().replace(/\s+/g, "").toUpperCase();
  const code = `${projectName}`;

  const project = projectRepo.create({
    ...data,
    code,
    company: { id: company.id },
    createdBy: { id: currentUser.userId },
    updatedBy: { id: currentUser.userId },
  });

  //return await projectRepo.save(project);
  return await saveRefetchSanitize({
      entityName: "CompanyProject",
      save: () => projectRepo.save(project),
      refetch: () =>
        projectRepo.findOneOrFail({
          where: { id: project.id, company: { id: currentUser.companyId } },
          relations: [
            "company",
            "createdBy",
            "updatedBy",
          ],
        }),
      rules: sanitizeRules,
      defaultError: "Proje kaydı oluşturulamadı.",
    });
};

export const getCompanyProjects = async (companyId: string) => {
  const projects = await projectRepo.find({
    where: { company: { id: companyId } },
    relations: ["createdBy", "updatedBy","company"],
    order: { createdatetime: "DESC" },
  });

  return sanitizeEntity(projects, "CompanyProject", sanitizeRules);
};

export const getProjectById = async (id: string, companyId: string) => {
  const project = await projectRepo.findOne({
    where: {
      id,
      company: { id: companyId },
    },
    relations: ["createdBy", "updatedBy","company"],
  });

  if (!project) {
    throw new Error("Proje bulunamadı.");
  }

  return sanitizeEntity(project, "CompanyProject", sanitizeRules);
};
