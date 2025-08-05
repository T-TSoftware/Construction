import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import {
  createCompanyCheck,
  updateCompanyCheck,
  getCompanyChecks,
  getCompanyCheckById,
} from "../services/companyCheck.service";

export const postCompanyCheckHandler = async (req: Request, res: Response) => {
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
      checkNo,
      checkDate,
      transactionDate,
      firm,
      amount,
      bankCode,
      type,
      projectId,
      description,
      status,
      dueDate,
    } = req.body;

    const newCheck = await createCompanyCheck(
      {
        checkNo,
        checkDate,
        transactionDate,
        firm,
        amount,
        bankCode,
        type,
        projectId,
        description,
        status,
        dueDate,
      },
      { userId, companyId },
      queryRunner.manager
    );

    await queryRunner.commitTransaction();
    res.status(201).json(newCheck);
  } catch (error: any) {
    await queryRunner.rollbackTransaction();
    console.error("❌ POST company check error:", error);
    res.status(500).json({
      errorMessage: error.message || "Çek kaydı oluşturulamadı.",
    });
  } finally {
    await queryRunner.release();
  }
};

export const patchCompanyCheckHandler = async (req: Request, res: Response) => {
  // 🔒 Yetki kontrolü
  if (req.user?.role !== "superadmin") {
    res.status(403).json({
      errorMessage: "Yalnızca superadmin işlem yapabilir.",
    });
    return;
  }

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const userId = req.user!.userId.toString();
    const companyId = req.user!.companyId;
    const code = req.params.code;
    const body = req.body;

    // 📌 Parametreden gelen 'code' kontrolü
    if (!code || typeof code !== "string") {
      throw new Error("Geçerli bir 'code' parametresi gereklidir.");
    }

    // 🔁 Check güncelleme işlemi
    const updatedCheck = await updateCompanyCheck(
      code,
      body,
      { userId, companyId },
      queryRunner.manager
    );

    await queryRunner.commitTransaction();
    res.status(200).json(updatedCheck);
    return;
  } catch (error: any) {
    await queryRunner.rollbackTransaction();
    console.error("❌ PATCH check update error:", error);
    res.status(400).json({
      errorMessage: error.message || "Çek güncellenemedi.",
    });
    return;
  } finally {
    await queryRunner.release();
  }
};

export const getCompanyChecksHandler = async (req: Request, res: Response) => {
  /*if (req.user?.role !== "superadmin") {
    res
      .status(403)
      .json({ errorMessage: "Yalnızca superadmin işlem yapabilir." });
    return;
  }*/

  try {
    const userId = req.user!.userId.toString();
    const companyId = req.user!.companyId;

    const checks = await getCompanyChecks(
      { userId, companyId },
      AppDataSource.manager
    );

    res.status(200).json({ checks });
  } catch (error: any) {
    console.error("❌ GET checks transactions error:", error);
    res.status(500).json({
      errorMessage: error.message || "Çekler getirilemedi.",
    });
  }
};

export const getCompanyCheckByIdHandler = async (
  req: Request,
  res: Response
) => {
  if (req.user?.role !== "superadmin") {
    res.status(403).json({ error: "Yalnızca superadmin işlem yapabilir." });
    return;
  }

  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: "Check ID zorunludur." });
      return;
    }

    const userId = req.user!.userId.toString();
    const companyId = req.user!.companyId;

    const check = await getCompanyCheckById(id, { userId, companyId });
    res.status(200).json(check);
  } catch (error: any) {
    console.error("❌ GET check by ID error:", error);
    res.status(500).json({ error: error.message || "Çek bilgisi alınamadı." });
  }
};
