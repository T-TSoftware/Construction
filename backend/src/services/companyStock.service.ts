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

export const updateCompanyStock = async (
  code: string,
  data: {
    name?: string;
    category?: string;
    description?: string;
    unit?: string;
    quantity?: number;
    minimumQuantity?: number;
    location?: string;
    stockDate?: Date;
    projectId?: string | null;
  },
  currentUser: {
    userId: string;
    companyId: string;
  }
) => {
  const stock = await stockRepo.findOne({
    where: {
      code,
      company: { id: currentUser.companyId },
    },
    relations: ["company", "project"],
  });

  if (!stock) {
    throw new Error("Stok kaydı bulunamadı.");
  }

  if (data.projectId !== undefined) {
    if (data.projectId === null) {
      stock.project = null;
    } else {
      const project = await projectRepo.findOneByOrFail({ id: data.projectId });
      stock.project = project;
    }
  }

  stock.name = data.name ?? stock.name;
  stock.category = data.category ?? stock.category;
  stock.description = data.description ?? stock.description;
  stock.unit = data.unit ?? stock.unit;
  stock.quantity = data.quantity ?? stock.quantity;
  stock.minimumQuantity = data.minimumQuantity ?? stock.minimumQuantity;
  stock.location = data.location ?? stock.location;
  stock.stockDate = data.stockDate ?? stock.stockDate;

  stock.updatedBy = { id: currentUser.userId } as any;
  stock.updatedatetime = new Date();

  return await stockRepo.save(stock);
};

export const getCompanyStocks = async (companyId: string) => {
  const stocks = await stockRepo.find({
    where: { company: { id: companyId } },
    relations: ["createdBy", "updatedBy", "project"],
    order: { createdatetime: "DESC" },
  });

  return stocks.map((s) => ({
    code: s.code,
    name: s.name,
    category: s.category,
    unit: s.unit,
    quantity: s.quantity,
    minimumQuantity: s.minimumQuantity,
    description: s.description,
    location: s.location,
    stockDate: s.stockDate,
    projectCode: s.project?.code ?? null,
    createdBy: s.createdBy?.name ?? null,
    updatedBy: s.updatedBy?.name ?? null,
    createdatetime: s.createdatetime,
    updatedatetime: s.updatedatetime,
  }));
};