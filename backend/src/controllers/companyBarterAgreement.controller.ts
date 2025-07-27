import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import {
  createCompanyBarterAgreement,
  createCompanyBarterAgreementFromProject,
  getAllCompanyBarterAgreements,
  getAllCompanyBarterAgreementsByProjectId,
  getCompanyBarterAgreementById,
  updateCompanyBarterAgreement,
} from "../services/companyBarterAgreement.service";

export const postCompanyBarterAgreementHandler = async (
  req: Request,
  res: Response
) => {
  // 🔐 Yalnızca superadmin işlem yapabilir
  if (req.user?.role !== "superadmin") {
    res
      .status(403)
      .json({ errorMessage: "Yalnızca superadmin işlemi yapabilir." });
    return;
  }

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const userId = req.user!.userId.toString();
    const companyId = req.user!.companyId;

    const {
      projectCode,
      counterpartyType,
      counterpartyId,
      counterpartyName,
      agreementDate,
      status,
      description,
      totalOurValue,
      totalTheirValue,
      //items,
    } = req.body;

    const newAgreement = await createCompanyBarterAgreement(
      {
        projectCode,
        counterpartyType,
        counterpartyId,
        counterpartyName,
        agreementDate,
        status,
        description,
        totalOurValue,
        totalTheirValue,
        //items,
      },
      { userId, companyId },
      queryRunner.manager
    );

    await queryRunner.commitTransaction();
    res.status(201).json(newAgreement);
  } catch (error: any) {
    await queryRunner.rollbackTransaction();
    console.error("❌ POST company barter agreement error:", error);
    res.status(500).json({
      errorMessage: error.message || "Barter kaydı oluşturulamadı.",
    });
  } finally {
    await queryRunner.release();
  }
};

export const postCompanyBarterAgreementFromProjectHandler = async (
  req: Request,
  res: Response
) => {
  if (req.user?.role !== "superadmin") {
    res
      .status(403)
      .json({ errorMessage: "Yalnızca superadmin işlemi yapabilir." });
    return;
  }

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const userId = req.user!.userId.toString();
    const companyId = req.user!.companyId;
    const { projectId } = req.params;

    const {
      counterpartyType,
      counterpartyId,
      counterpartyName,
      agreementDate,
      status,
      description,
      totalOurValue,
      totalTheirValue,
    } = req.body;

    const newAgreement = await createCompanyBarterAgreementFromProject(
      projectId,
      {
        counterpartyType,
        counterpartyId,
        counterpartyName,
        agreementDate,
        status,
        description,
        totalOurValue,
        totalTheirValue,
      },
      { userId, companyId },
      queryRunner.manager
    );

    await queryRunner.commitTransaction();
    res.status(201).json(newAgreement);
  } catch (error: any) {
    await queryRunner.rollbackTransaction();
    console.error("❌ POST company barter agreement error:", error);
    res.status(500).json({
      errorMessage:
        error.message || "Takas anlaşması oluşturulurken bir hata oluştu.",
    });
  } finally {
    await queryRunner.release();
  }
};

export const patchCompanyBarterAgreementHandler = async (
  req: Request,
  res: Response
) => {
  if (req.user?.role !== "superadmin") {
    res
      .status(403)
      .json({ errorMessage: "Yalnızca superadmin işlem yapabilir." });
    return;
  }

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const userId = req.user!.userId.toString();
    const companyId = req.user!.companyId;
    const id = req.params.id;
    const body = req.body;

    if (!id || typeof id !== "string") {
      throw new Error("Geçerli bir 'id' parametresi gereklidir.");
    }

    const updatedAgreement = await updateCompanyBarterAgreement(
      id,
      body,
      { userId, companyId },
      queryRunner.manager
    );

    await queryRunner.commitTransaction();
    res.status(200).json(updatedAgreement);
    return;
  } catch (error: any) {
    await queryRunner.rollbackTransaction();
    console.error("❌ PATCH barter agreement error:", error);
    res.status(400).json({
      errorMessage: error.message || "Takas anlaşması güncellenemedi.",
    });
    return;
  } finally {
    await queryRunner.release();
  }
};

export const getAllCompanyBarterAgreementsHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user!.userId.toString();
    const companyId = req.user!.companyId;

    const result = await getAllCompanyBarterAgreements({ userId, companyId });

    res.status(200).json(result);
  } catch (error: any) {
    console.error("❌ GET all company barter agreements error:", error);
    res.status(500).json({
      errorMessage: error.message || "Takas anlaşmaları listesi alınamadı.",
    });
  }
};

export const getAllCompanyBarterAgreementsByProjectIdHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user!.userId.toString();
    const companyId = req.user!.companyId;
    const projectId = req.params.projectId;

    const result = await getAllCompanyBarterAgreementsByProjectId(projectId, {
      userId,
      companyId,
    });

    res.status(200).json(result);
  } catch (error: any) {
    console.error("❌ GET company barter agreements by project error:", error);
    res.status(500).json({
      errorMessage: error.message || "Proje bazlı takas anlaşmaları alınamadı.",
    });
  }
};

export const getCompanyBarterAgreementByIdHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user!.userId.toString();
    const companyId = req.user!.companyId;
    const { id } = req.params;

    const result = await getCompanyBarterAgreementById(id, {
      userId,
      companyId,
    });

    res.status(200).json(result);
  } catch (error: any) {
    console.error("❌ GET company barter agreement by ID error:", error);
    res.status(500).json({
      errorMessage: error.message || "Takas anlaşması alınamadı.",
    });
  }
};
