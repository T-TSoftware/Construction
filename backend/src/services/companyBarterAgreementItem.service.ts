import { AppDataSource } from "../config/data-source";
import { EntityManager } from "typeorm";
import { CompanyBarterAgreement } from "../entities/CompanyBarterAgreement";
import { CompanyBarterAgreementItem } from "../entities/CompanyBarterAgreementItem";
import { CompanyStock } from "../entities/CompanyStock";
import { ProjectSubcontractor } from "../entities/ProjectSubcontractor";
import { ProjectSupplier } from "../entities/ProjectSupplier";
import { processBarterItem } from "./processBarterItem.serivce";

export const postCompanyBarterAgreementItem = async (
  agreementId: string,
  data: {
    direction: "OUT" | "IN";
    itemType: "STOCK" | "SERVICE" | "ASSET" | "CASH" | "CHECK";
    description: string;
    agreedValue: number;
    relatedStockCode?: string;
    relatedSubcontractorCode?: string;
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

  const relatedSubcontractor = data.relatedSubcontractorCode
    ? await subcontractorRepo.findOneBy({
        code: data.relatedSubcontractorCode,
        company: { id: currentUser.companyId },
      })
    : null;

  const relatedSupplier = data.relatedSupplierCode
    ? await supplierRepo.findOneBy({
        code: data.relatedSupplierCode,
        company: { id: currentUser.companyId },
      })
    : null;

  const item = itemRepo.create({
    barterAgreement: agreement,
    company: { id: currentUser.companyId },
    direction: data.direction,
    itemType: data.itemType,
    description: data.description,
    agreedValue: data.agreedValue,
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
