import { EntityManager } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { Company } from "../entities/Company";
import { CompanyProject } from "../entities/CompanyProject";
import { CompanyStock } from "../entities/CompanyStock";
import { saveRefetchSanitize } from "../utils/persist";
import { sanitizeRules } from "../utils/sanitizeRules";
import { slug } from "../utils/slugHelper";
import { sanitizeEntity } from "../utils/sanitize";
//import { generateStockCode } from "../utils/generateCode";

const stockRepo = AppDataSource.getRepository(CompanyStock);
const companyRepo = AppDataSource.getRepository(Company);
const projectRepo = AppDataSource.getRepository(CompanyProject);

export const createCompanyStock = async (
  data: {
    //companyId: string;
    projectId?: string;
    //stockItemId: string; // ✅ yeni alan — bağlı stockItem'ın ID'si
    //code: string;
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
  },
  manager: EntityManager = AppDataSource.manager
) => {
  const stockRepo = manager.getRepository(CompanyStock);
  const companyRepo = manager.getRepository(Company);
  const projectRepo = manager.getRepository(CompanyProject);

  const company = await companyRepo.findOneByOrFail({
    id: currentUser.companyId,
  });

  const project = data.projectId
    ? await projectRepo.findOneByOrFail({ id: data.projectId })
    : null;

  /*const existing = await stockRepo.findOne({
    where: {
      category: data.category,
      name: data.name,
    },
  });

  if (existing) {
    throw new Error(`${data.category} - ${data.name} stoğu zaten mevcut.`);
  }*/
  //const code = await generateStockCode(data.category, manager);
  const categorySlug = slug(data.category).toUpperCase(); // CATEGORY kısmı büyük
  const nameSlug = slug(data.name).toLowerCase(); // name kısmı küçük (istersen upper yap)
  const code = `STK-${categorySlug}-${nameSlug}`;

  const stock = stockRepo.create({
    ...data,
    code,
    company: { id: currentUser.companyId },
    project: project ? { id: data.projectId } : null,
    createdBy: { id: currentUser.userId },
    updatedBy: { id: currentUser.userId },
  });

  //return await stockRepo.save(stock);
  return await saveRefetchSanitize({
    entityName: "CompanyStock",
    save: () => stockRepo.save(stock),
    refetch: () =>
      stockRepo.findOneOrFail({
        where: { id: stock.id, company: { id: currentUser.companyId } },
        relations: ["project", "company", "createdBy", "updatedBy"],
      }),
    rules: sanitizeRules,
    defaultError: "Stok kaydı oluşturulamadı.",
  });
};

export const updateCompanyStock = async (
  id: string,
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
  },
  manager: EntityManager = AppDataSource.manager // ✅ default olarak global manager
) => {
  const stockRepo = manager.getRepository(CompanyStock);
  const projectRepo = manager.getRepository(CompanyProject);
  const stock = await stockRepo.findOne({
    where: {
      id,
      company: { id: currentUser.companyId },
    },
    relations: ["company", "project","createdBy", "updatedBy"],
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

  //return await stockRepo.save(stock);
  return await saveRefetchSanitize({
    entityName: "CompanyStock",
    save: () => stockRepo.save(stock),
    refetch: () =>
      stockRepo.findOneOrFail({
        where: { id: stock.id, company: { id: currentUser.companyId } },
        relations: ["project", "company", "createdBy", "updatedBy"],
      }),
    rules: sanitizeRules,
    defaultError: "Stok kaydı güncellenemedi.",
  });
};

export const getCompanyStocks = async (companyId: string) => {
  const stocks = await stockRepo.find({
    where: { company: { id: companyId } },
    relations: ["createdBy", "updatedBy", "project","company"],
    order: { createdatetime: "DESC" },
  });

  return sanitizeEntity(stocks, "CompanyStock", sanitizeRules);
};

export const getCompanyStockById = async (
  id: string,
  currentUser: { userId: string; companyId: string }
) => {
  const stock = await stockRepo.findOne({
    where: {
      id,
      company: { id: currentUser.companyId },
    },
    relations: ["createdBy", "updatedBy", "project", "company"],
  });

  return sanitizeEntity(stock, "CompanyStock", sanitizeRules);
};

export const decreaseStockQuantity = async (
  options: {
    stockId: string;
    quantity: number; // kaç adet düşülecek
  },
  manager: EntityManager
): Promise<void> => {
  const stockRepo = manager.getRepository(CompanyStock);

  const stock = await stockRepo.findOneByOrFail({ id: options.stockId });

  if (stock.quantity < options.quantity) {
    throw new Error(
      `Stok yetersiz: Mevcut ${stock.quantity}, istenen ${options.quantity}`
    );
  }

  stock.quantity -= options.quantity;
  stock.updatedatetime = new Date();

  await stockRepo.save(stock);
};
