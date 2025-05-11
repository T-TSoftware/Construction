import { AppDataSource } from "../config/data-source";
import { Company } from "../entities/Company";
import { CompanyProject } from "../entities/CompanyProject";
import { CompanyStock } from "../entities/CompanyStock";

const stockRepo = AppDataSource.getRepository(CompanyStock);
const companyRepo = AppDataSource.getRepository(Company);
const projectRepo = AppDataSource.getRepository(CompanyProject);

export const createCompanyStock = async (
  data: {
    //companyId: string;
    projectId?: string;
    code: string;
    name: string;
    category: string;
    description?: string;
    unit: string;
    quantity?: number;
    minimumQuantity?: number;
    location?: string;
    stockDate?: Date;
  },
  currentUser: {
    userId: string;
    companyId: string;
  }
) => {
  const company = await companyRepo.findOneByOrFail({
    id: currentUser.companyId,
  });
  const project = data.projectId
    ? await projectRepo.findOneByOrFail({ id: data.projectId })
    : null;

  const stock = stockRepo.create({
    ...data,
    company: { id: company.id },
    project: project ? { id: data.projectId } : null,
    createdBy: { id: currentUser.userId },
    updatedBy: { id: currentUser.userId },
  });

  return await stockRepo.save(stock);
};
