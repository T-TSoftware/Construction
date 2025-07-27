import { AppDataSource } from "../config/data-source";
import { EntityManager } from "typeorm";
import { CompanyBarterAgreement } from "../entities/CompanyBarterAgreement";
import { CompanyProject } from "../entities/CompanyProject";
import { Company } from "../entities/Company";
import { generateNextEntityCode } from "../utils/generateCode";
import { processBarterItem } from "./processBarterItem.serivce";

export const createCompanyBarterAgreement = async (
  data: {
    projectCode: string;
    counterpartyType: "SUPPLIER" | "SUBCONTRACTOR" | "CUSTOMER" | "EXTERNAL";
    counterpartyId?: string;
    counterpartyName: string;
    agreementDate: Date;
    status: "DRAFT" | "PROPOSED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
    description?: string;
    totalOurValue?: number;
    totalTheirValue?: number;
  },
  currentUser: {
    userId: string;
    companyId: string;
  },
  manager: EntityManager = AppDataSource.manager
) => {
  const agreementRepo = manager.getRepository(CompanyBarterAgreement);
  const projectRepo = manager.getRepository(CompanyProject);

  // ✅ Proje kontrolü
  const project = await projectRepo.findOneOrFail({
    where: {
      code: data.projectCode,
      company: { id: currentUser.companyId },
    },
  });

  const code = await generateNextEntityCode(
    manager,
    project.code,
    data.counterpartyType,
    "BRT", // BARTER
    "CompanyBarterAgreement"
  );

  // ✅ Yeni takas anlaşması nesnesi oluşturuluyor
  const agreement = agreementRepo.create({
    code,
    project: { id: project.id },
    company: { id: currentUser.companyId },
    counterpartyType: data.counterpartyType,
    counterpartyId: data.counterpartyId ?? null,
    counterpartyName: data.counterpartyName,
    agreementDate: data.agreementDate,
    status: data.status,
    description: data.description,
    totalOurValue: data.totalOurValue ?? 0,
    totalTheirValue: data.totalTheirValue ?? 0,
    createdBy: { id: currentUser.userId },
    updatedBy: { id: currentUser.userId },
  });

  return await agreementRepo.save(agreement);
};

export const createCompanyBarterAgreementFromProject = async (
  projectId: string, // 🔄 Artık data içinde değil, parametre
  data: {
    counterpartyType: "SUPPLIER" | "SUBCONTRACTOR" | "CUSTOMER" | "EXTERNAL";
    counterpartyId?: string;
    counterpartyName: string;
    agreementDate: Date;
    status: "DRAFT" | "PROPOSED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
    description?: string;
    totalOurValue?: number;
    totalTheirValue?: number;
  },
  currentUser: {
    userId: string;
    companyId: string;
  },
  manager: EntityManager = AppDataSource.manager
) => {
  const agreementRepo = manager.getRepository(CompanyBarterAgreement);
  const projectRepo = manager.getRepository(CompanyProject);

  // ✅ Proje kontrolü
  const project = await projectRepo.findOneOrFail({
    where: {
      id: projectId,
      company: { id: currentUser.companyId },
    },
  });

  const code = await generateNextEntityCode(
    manager,
    project.code,
    data.counterpartyType,
    "BRT", // BARTER
    "CompanyBarterAgreement"
  );

  // ✅ Yeni takas anlaşması nesnesi oluşturuluyor
  const agreement = agreementRepo.create({
    code,
    project: { id: project.id },
    company: { id: currentUser.companyId },
    counterpartyType: data.counterpartyType,
    counterpartyId: data.counterpartyId ?? null,
    counterpartyName: data.counterpartyName,
    agreementDate: data.agreementDate,
    status: data.status,
    description: data.description,
    totalOurValue: data.totalOurValue ?? 0,
    totalTheirValue: data.totalTheirValue ?? 0,
    createdBy: { id: currentUser.userId },
    updatedBy: { id: currentUser.userId },
  });

  return await agreementRepo.save(agreement);
};

export const updateCompanyBarterAgreement = async (
  id: string,
  data: {
    projectCode?: string; // ✅ Eklenen alan
    counterpartyType?: "SUPPLIER" | "SUBCONTRACTOR" | "CUSTOMER" | "EXTERNAL";
    counterpartyId?: string;
    counterpartyName?: string;
    agreementDate?: Date;
    status?: "DRAFT" | "PROPOSED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
    description?: string;
    totalOurValue?: number;
    totalTheirValue?: number;
  },
  currentUser: { userId: string; companyId: string },
  manager: EntityManager = AppDataSource.manager
) => {
  const repo = manager.getRepository(CompanyBarterAgreement);
  const projectRepo = manager.getRepository(CompanyProject);

  const agreement = await repo.findOneOrFail({
    where: { id, company: { id: currentUser.companyId } },
    relations: ["project"],
  });

  // ✅ Proje güncellemesi yapılacaksa kontrol ve atama
  if (data.projectCode) {
    const newProject = await projectRepo.findOneOrFail({
      where: {
        code: data.projectCode,
        company: { id: currentUser.companyId },
      },
    });
    agreement.project = newProject;
  }

  agreement.counterpartyType =
    data.counterpartyType ?? agreement.counterpartyType;
  agreement.counterpartyId = data.counterpartyId ?? agreement.counterpartyId;
  agreement.counterpartyName =
    data.counterpartyName ?? agreement.counterpartyName;
  agreement.agreementDate = data.agreementDate ?? agreement.agreementDate;
  agreement.description = data.description ?? agreement.description;
  agreement.totalOurValue = data.totalOurValue ?? agreement.totalOurValue;
  agreement.totalTheirValue = data.totalTheirValue ?? agreement.totalTheirValue;
  agreement.updatedBy = { id: currentUser.userId } as any;

  const prevStatus = agreement.status;
  const newStatus = data.status ?? prevStatus;

  agreement.status = newStatus;

  if (prevStatus !== "COMPLETED" && newStatus === "COMPLETED") {
    console.log("enterence prevvv");
    await completeBarterAgreement(id, currentUser);
  }

  return await repo.save(agreement);
};

export const getAllCompanyBarterAgreements = async (
  currentUser: { userId: string; companyId: string },
  manager: EntityManager = AppDataSource.manager
) => {
  const repo = manager.getRepository(CompanyBarterAgreement);

  const agreements = await repo.find({
    where: { company: { id: currentUser.companyId } },
    order: { createdatetime: "DESC" },
    relations: ["project"],
  });

  return agreements;
};

export const getAllCompanyBarterAgreementsByProjectId = async (
  projectId: string,
  currentUser: { userId: string; companyId: string },
  manager: EntityManager = AppDataSource.manager
) => {
  const repo = manager.getRepository(CompanyBarterAgreement);

  const agreements = await repo.find({
    where: {
      project: { id: projectId },
      company: { id: currentUser.companyId },
    },
    order: { createdatetime: "DESC" },
    relations: ["project"],
  });

  return agreements;
};

export const getCompanyBarterAgreementById = async (
  id: string,
  currentUser: { userId: string; companyId: string },
  manager: EntityManager = AppDataSource.manager
) => {
  const repo = manager.getRepository(CompanyBarterAgreement);

  const agreement = await repo.findOne({
    where: {
      id,
      company: { id: currentUser.companyId },
    },
    relations: ["project"],
  });

  if (!agreement) {
    throw new Error("Takas anlaşması bulunamadı.");
  }

  return agreement;
};

export const completeBarterAgreement = async (
  agreementId: string,
  currentUser: { userId: string; companyId: string }
) => {
  const manager = AppDataSource.manager;
  const agreementRepo = manager.getRepository(CompanyBarterAgreement);

  const agreement = await agreementRepo.findOne({
    where: {
      id: agreementId,
      company: { id: currentUser.companyId },
    },
    relations: [
      "items",
      "items.relatedStock",
      "items.relatedSubcontractor",
      "items.relatedSupplier",
    ],
  });

  if (!agreement) {
    throw new Error("Takas anlaşması bulunamadı.");
  }

  for (const item of agreement.items) {
    console.log(agreement.items, " agreement code:", agreement.code);
    console.log("enter 2");
    await processBarterItem({
      item,
      agreementCode: agreement.code,
      currentUser,
      manager,
    });
  }

  return agreement;
};
