import { AppDataSource } from "../config/data-source";
import { EntityManager } from "typeorm";
import { CompanyBarterAgreement } from "../entities/CompanyBarterAgreement";
import { CompanyBarterAgreementItem } from "../entities/CompanyBarterAgreementItem";
import { CompanyStock } from "../entities/CompanyStock";
import { ProjectSubcontractor } from "../entities/ProjectSubcontractor";
import { ProjectSupplier } from "../entities/ProjectSupplier";
import { processBarterItem } from "./processBarterItem.serivce";
import { generateNextBarterAgreementItemCode } from "../utils/generateCode";
import { User } from "../entities/User";

export const postCompanyBarterAgreementItem = async (
  agreementId: string,
  data: {
    direction: "OUT" | "IN";
    itemType: "STOCK" | "SERVICE" | "ASSET" | "CASH" | "CHECK";
    description: string;
    agreedValue: number;
    relatedStockCode?: string;
    relatedSubcontractorId?: string;
    relatedSupplierCode?: string;
    assetDetails?: Record<string, any>;
  },
  currentUser: { userId: string; companyId: string },
  manager: EntityManager = AppDataSource.manager
) => {
  const agreementRepo = manager.getRepository(CompanyBarterAgreement);
  const itemRepo = manager.getRepository(CompanyBarterAgreementItem);
  const stockRepo = manager.getRepository(CompanyStock);
  const subcontractorRepo = manager.getRepository(ProjectSubcontractor);
  const supplierRepo = manager.getRepository(ProjectSupplier);

  const agreement = await agreementRepo.findOneOrFail({
    where: {
      id: agreementId,
      company: { id: currentUser.companyId },
    },
  });

  const relatedStock = data.relatedStockCode
    ? await stockRepo.findOneBy({
        code: data.relatedStockCode,
        company: { id: currentUser.companyId },
      })
    : null;

  const relatedSubcontractor = data.relatedSubcontractorId
    ? await subcontractorRepo.findOneBy({
        id: data.relatedSubcontractorId,
        company: { id: currentUser.companyId },
      })
    : null;

  const relatedSupplier = data.relatedSupplierCode
    ? await supplierRepo.findOneBy({
        code: data.relatedSupplierCode,
        company: { id: currentUser.companyId },
      })
    : null;

  const code = await generateNextBarterAgreementItemCode(
    manager,
    agreement.code,
    data.itemType
  );

  const item = itemRepo.create({
    code,
    barterAgreement: agreement,
    company: { id: currentUser.companyId },
    direction: data.direction,
    itemType: data.itemType,
    description: data.description,
    agreedValue: data.agreedValue,
    remainingAmount: data.itemType === "CASH" ? data.agreedValue : null,
    relatedStock: relatedStock ? { id: relatedStock.id } : null,
    relatedSubcontractor: relatedSubcontractor
      ? { id: relatedSubcontractor.id }
      : null,
    relatedSupplier: relatedSupplier ? { id: relatedSupplier.id } : null,
    assetDetails: data.assetDetails ?? undefined,
    createdBy: { id: currentUser.userId },
    updatedBy: { id: currentUser.userId },
  });

  return await itemRepo.save(item);
};

export const getAllCompanyBarterAgreementItems = async (
  currentUser: { userId: string; companyId: string },
  manager: EntityManager = AppDataSource.manager
) => {
  const itemRepo = manager.getRepository(CompanyBarterAgreementItem);

  return await itemRepo.find({
    where: {
      company: { id: currentUser.companyId },
    },
    order: { createdatetime: "DESC" },
    relations: {
      barterAgreement: true,
      relatedStock: true,
      relatedSubcontractor: true,
      relatedSupplier: true,
    },
  });
};

export const getCompanyBarterAgreementItemsByAgreementId = async (
  barterId: string,
  currentUser: { userId: string; companyId: string },
  manager: EntityManager = AppDataSource.manager
) => {
  const itemRepo = manager.getRepository(CompanyBarterAgreementItem);

  return await itemRepo.find({
    where: {
      barterAgreement: { id: barterId },
      company: { id: currentUser.companyId },
    },
    order: { createdatetime: "DESC" },
    relations: {
      relatedStock: true,
      relatedSubcontractor: true,
      relatedSupplier: true,
    },
  });
};

export const getCompanyBarterAgreementItemById = async (
  itemId: string,
  currentUser: { userId: string; companyId: string },
  manager: EntityManager = AppDataSource.manager
) => {
  const itemRepo = manager.getRepository(CompanyBarterAgreementItem);

  return await itemRepo.findOneOrFail({
    where: {
      id: itemId,
      company: { id: currentUser.companyId },
    },
    relations: {
      barterAgreement: true,
      relatedStock: true,
      relatedSubcontractor: true,
      relatedSupplier: true,
    },
  });
};

export const updateBarterItemPaymentStatus = async (
  itemCode: string,
  processedAmount: number,
  currentUser: { userId: string },
  manager: EntityManager
) => {
  const barterItemRepo = manager.getRepository(CompanyBarterAgreementItem);

  const barterItem = await barterItemRepo.findOneByOrFail({ code: itemCode });

  const totalProcessedAmount =
    Number(barterItem.processedAmount ?? 0) + processedAmount;

  const remainingAmount =
    Number(barterItem.remainingAmount) - Number(processedAmount);

  let status: "PAID" | "COLLECTED" | "PARTIAL";
  if (remainingAmount <= 0) {
    status = barterItem.direction === "OUT" ? "PAID" : "COLLECTED";
  } else {
    status = "PARTIAL";
  }
  barterItem.processedAmount = totalProcessedAmount;
  barterItem.status = status;
  barterItem.remainingAmount = remainingAmount;
  barterItem.updatedBy = { id: currentUser.userId } as User;

  return await barterItemRepo.save(barterItem);
};

export const updateBarterItemPaymentStatusNew = async (
  itemCode: string,
  amount: number,
  currentUser: { userId: string },
  manager: EntityManager,
  isReverse = false
) => {
  const barterItemRepo = manager.getRepository(CompanyBarterAgreementItem);

  const barterItem = await barterItemRepo.findOneByOrFail({ code: itemCode });

  const factor = isReverse ? -1 : 1;

  // ✅ processedAmount güncelle (increment/decrement)
  await barterItemRepo.increment(
    { id: barterItem.id },
    "processedAmount",
    factor * amount
  );

  // Güncellenmiş veriyi tekrar al
  const updatedItem = await barterItemRepo.findOneOrFail({
    where: { id: barterItem.id },
  });

  // ✅ remainingAmount hesapla
  const remainingAmount =
    Number(updatedItem.agreedValue ?? 0) - Number(updatedItem.processedAmount);

  // ✅ status belirle
  let status: "PAID" | "COLLECTED" | "PARTIAL";
  if (remainingAmount <= 0) {
    status = updatedItem.direction === "OUT" ? "PAID" : "COLLECTED";
  } else {
    status = "PARTIAL";
  }

  updatedItem.remainingAmount = remainingAmount;
  updatedItem.status = status;
  updatedItem.updatedBy = { id: currentUser.userId } as User;
  updatedItem.updatedatetime = new Date();

  return await barterItemRepo.save(updatedItem);
};
