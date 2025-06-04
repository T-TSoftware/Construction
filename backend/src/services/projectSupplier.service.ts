import { AppDataSource } from "../config/data-source";
import { EntityManager } from "typeorm";
import { ProjectSupplier } from "../entities/ProjectSupplier";
import { CompanyProject } from "../entities/CompanyProject";
import { generateNextEntityCode } from "../utils/generateCode";
import { QuantityItem } from "../entities/QuantityItem";

const supplierRepo = AppDataSource.getRepository(ProjectSupplier);
const projectRepo = AppDataSource.getRepository(CompanyProject);
const quantityItemRepo = AppDataSource.getRepository(QuantityItem);

export const createProjectSupplier = async (
  data: {
    projectId: string;
    quantityItemCode: string;
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
  },
  manager: EntityManager = AppDataSource.manager // ✅ default manager
) => {
  const supplierRepo = manager.getRepository(ProjectSupplier);
  const projectRepo = manager.getRepository(CompanyProject);
  const quantityItemRepo = manager.getRepository(QuantityItem);

  const project = await projectRepo.findOneByOrFail({ id: data.projectId });

  const quantityItem = await quantityItemRepo.findOneByOrFail({
    code: data.quantityItemCode.trim().toUpperCase(),
  });

  const code = await generateNextEntityCode(
    manager,
    project.code,
    data.category,
    "TED",
    "ProjectSupplier"
  );

  const remainingAmount =
    typeof data.contractAmount === "number" &&
    typeof data.paidAmount === "number"
      ? data.contractAmount - data.paidAmount
      : undefined;

  const supplier = supplierRepo.create({
    ...data,
    code,
    quantityItem: { id: quantityItem.id },
    remainingAmount,
    project: { id: data.projectId },
    createdBy: { id: currentUser.userId },
    updatedBy: { id: currentUser.userId },
  });

  return await supplierRepo.save(supplier);
};

export const getProjectSuppliers = async (projectId: string) => {
  const suppliers = await supplierRepo.find({
    where: { project: { id: projectId } },
    relations: ["createdBy", "updatedBy", "quantityItem"],
    order: { createdatetime: "DESC" },
  });

  return suppliers.map((s) => ({
    id: s.id,
    code: s.code,
    category: s.category,
    quantityItemCode: s.quantityItem.code,
    //quantityItem: s.quantityItem?.code ?? null,
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

export const updateProjectSupplier = async (
  projectId: string,
  code: string,
  data: {
    //quantityItemCode?: string;
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
  },
  manager: EntityManager = AppDataSource.manager // ✅ default olarak global manager
) => {
  const supplierRepo = manager.getRepository(ProjectSupplier);
  const supplier = await supplierRepo.findOne({
    where: {
      code,
      project: { id: projectId },
    },
    relations: ["project"],
  });

  if (!supplier) {
    throw new Error("Tedarikçi bulunamadı.");
  }

  // Yeni alanlar set ediliyor
  /*if (data.quantityItemCode) {
    const item = await quantityItemRepo.findOneByOrFail({
      code: data.quantityItemCode.trim().toUpperCase(),
    });
    supplier.quantityItem = item;
  }*/
  supplier.companyName = data.companyName ?? supplier.companyName;
  supplier.unit = data.unit ?? supplier.unit;
  supplier.unitPrice = data.unitPrice ?? supplier.unitPrice;
  supplier.quantity = data.quantity ?? supplier.quantity;
  if (Object.prototype.hasOwnProperty.call(data, "contractAmount")) {
    supplier.contractAmount = data.contractAmount!;
  }
  if (Object.prototype.hasOwnProperty.call(data, "paidAmount")) {
    supplier.paidAmount = data.paidAmount!;
  }
  //supplier.contractAmount = data.contractAmount ?? supplier.contractAmount;
  //supplier.paidAmount = data.paidAmount ?? supplier.paidAmount;
  supplier.status = data.status ?? supplier.status;
  supplier.description = data.description ?? supplier.description;

  if (
    supplier.contractAmount !== undefined &&
    supplier.paidAmount !== undefined
  ) {
    const contract = Number(supplier.contractAmount);
    const paid = Number(supplier.paidAmount);
    supplier.remainingAmount = contract - paid;
  } else {
    supplier.remainingAmount = null;
  }

  supplier.updatedBy = { id: currentUser.userId } as any;
  supplier.updatedatetime = new Date();

  return await supplierRepo.save(supplier);
};
