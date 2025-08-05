import { AppDataSource } from "../config/data-source";
import { EntityManager } from "typeorm";
import { ProjectSubcontractor } from "../entities/ProjectSubcontractor";
import { CompanyProject } from "../entities/CompanyProject";
import { generateNextEntityCode } from "../utils/generateCode";
import { ProjectEstimatedCost } from "../entities/ProjectEstimatedCost";
import { User } from "../entities/User";

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
    companyId: string;
  },
  manager: EntityManager = AppDataSource.manager
) => {
  const subcontractorRepo = manager.getRepository(ProjectSubcontractor);
  const projectRepo = manager.getRepository(CompanyProject);

  // 🔍 Şirket kontrolüyle birlikte projeyi getir
  const project = await projectRepo.findOneOrFail({
    where: {
      id: data.projectId,
      company: { id: currentUser.companyId },
    },
  });

  const code = await generateNextEntityCode(
    manager,
    project.code,
    data.category,
    "TAS", // Taşeron tipi kod
    "ProjectSubcontractor"
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
    project: { id: project.id },
    company: { id: currentUser.companyId },
    createdBy: { id: currentUser.userId },
    updatedBy: { id: currentUser.userId },
  });

  return await subcontractorRepo.save(subcontractor);
};

export const getProjectSubcontractors = async (
  projectId: string,
  companyId: string
) => {
  const subcontractors = await subcontractorRepo.find({
    where: {
      project: { id: projectId },
      company: { id: companyId },
    },
    relations: ["createdBy", "updatedBy"],
    order: { createdatetime: "DESC" },
  });

  return subcontractors.map((s) => ({
    id: s.id,
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
    companyId: string;
  },
  manager: EntityManager = AppDataSource.manager
) => {
  const subcontractorRepo = manager.getRepository(ProjectSubcontractor);
  const estimatedCostRepo = manager.getRepository(ProjectEstimatedCost);

  const subcontractor = await subcontractorRepo.findOne({
    where: {
      code,
      project: { id: projectId },
      company: { id: currentUser.companyId },
    },
    relations: ["project", "company", "projectQuantity", "quantityItem"], // ✅ Ek ilişkiler AGREED kısmı için
  });

  if (!subcontractor) {
    throw new Error("Taşeron bulunamadı.");
  }

  const isLocked = subcontractor.locked === true;

  // 🔐 Eğer taşeron locked ise sadece unitPrice ve status güncellenebilir
  if (isLocked) {
    subcontractor.unitPrice = data.unitPrice ?? subcontractor.unitPrice;
    subcontractor.status = data.status ?? subcontractor.status;
    subcontractor.companyName = data.companyName ?? subcontractor.companyName;

    if (Object.prototype.hasOwnProperty.call(data, "contractAmount")) {
      subcontractor.contractAmount = data.contractAmount!;
    }

    if (Object.prototype.hasOwnProperty.call(data, "paidAmount")) {
      subcontractor.paidAmount = data.paidAmount!;
    }

    if (
      subcontractor.contractAmount !== undefined &&
      subcontractor.paidAmount !== undefined
    ) {
      subcontractor.remainingAmount =
        Number(subcontractor.contractAmount) - Number(subcontractor.paidAmount);
    } else {
      subcontractor.remainingAmount = null;
    }
  } else {
    // 🔧 Güncellenebilir alanlar (locked değilse)
    subcontractor.unit = data.unit ?? subcontractor.unit;
    subcontractor.unitPrice = data.unitPrice ?? subcontractor.unitPrice;
    subcontractor.quantity = data.quantity ?? subcontractor.quantity;
    subcontractor.companyName = data.companyName ?? subcontractor.companyName;
    subcontractor.description = data.description ?? subcontractor.description;
    subcontractor.status = data.status ?? subcontractor.status;
    subcontractor.status = data.status ?? subcontractor.status;
    subcontractor.companyName = data.companyName ?? subcontractor.companyName;

    if (Object.prototype.hasOwnProperty.call(data, "contractAmount")) {
      subcontractor.contractAmount = data.contractAmount!;
    }

    if (Object.prototype.hasOwnProperty.call(data, "paidAmount")) {
      subcontractor.paidAmount = data.paidAmount!;
    }

    if (
      subcontractor.contractAmount !== undefined &&
      subcontractor.paidAmount !== undefined
    ) {
      subcontractor.remainingAmount =
        Number(subcontractor.contractAmount) - Number(subcontractor.paidAmount);
    } else {
      subcontractor.remainingAmount = null;
    }
  }

  subcontractor.updatedBy = { id: currentUser.userId } as any;
  subcontractor.updatedatetime = new Date();

  const saved = await subcontractorRepo.save(subcontractor);

  // ✅ AGREED durumunda tahmini maliyet oluştur
  if (data.status === "AGREED") {
    const existingEstimate = await estimatedCostRepo.findOne({
      where: {
        project: { id: projectId },
        company: { id: currentUser.companyId },
        sourceType: "SUBCONTRACTOR",
        referenceCode: subcontractor.code, // ✅ aynı referans kodla 1 kere oluşturulmuş mu
      },
    });

    if (!existingEstimate) {
      const isAutoGenerated = subcontractor.addedFromQuantityYN === "Y";

      const projectQuantityText =
        subcontractor.projectQuantity?.code && subcontractor.quantityItem?.name
          ? `${subcontractor.projectQuantity.code} - ${subcontractor.quantityItem.name}`
          : "manuel giriş";

      const estimatedCost = estimatedCostRepo.create({
        project: { id: projectId },
        company: { id: currentUser.companyId },
        unitPrice: subcontractor.unitPrice ?? 0,
        unit: subcontractor.unit,
        quantity: subcontractor.quantity,
        totalCost: subcontractor.contractAmount,
        sourceType: "SUBCONTRACTOR",
        referenceCode: subcontractor.code,
        category: subcontractor.category,
        name: isAutoGenerated
          ? `${subcontractor.companyName} • ${projectQuantityText} için otomatik taşeron`
          : `${subcontractor.companyName} • manuel taşeron`,
        description: isAutoGenerated
          ? `Metraj (${projectQuantityText}) kalemi için taşerondan otomatik oluşturuldu.`
          : `Taşeron kaydı manuel olarak girildi. Metraj bağlantısı bulunmamaktadır.`,
        createdBy: { id: currentUser.userId },
        updatedBy: { id: currentUser.userId },
      });

      await estimatedCostRepo.save(estimatedCost);
    }
  }

  return saved;
};

export const updateProjectSubcontractorStatus = async (
  subcontractorCode: string,
  amountReceived: number,
  currentUser: { userId: string; companyId: string },
  manager: EntityManager
) => {
  const subcontractorRepo = manager.getRepository(ProjectSubcontractor);

  const subcontractor = await subcontractorRepo.findOneOrFail({
    where: {
      code: subcontractorCode,
      company: { id: currentUser.companyId },
    },
  });

  subcontractor.paidAmount = Number(subcontractor.paidAmount ?? 0) + amountReceived;
  subcontractor.remainingAmount = Number(subcontractor.contractAmount) - subcontractor.paidAmount;
  subcontractor.status = subcontractor.remainingAmount <= 0 ? "PAID" : "PARTIAL";
  //order.updatedatetime = new Date();
  subcontractor.updatedBy = { id: currentUser.userId } as User;
  

  return await subcontractorRepo.save(subcontractor);
};
