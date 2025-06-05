import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { createCompanyCheck, updateCompanyCheck } from "../services/companyCheck.service";

export const postCompanyChecksHandler = async (req: Request, res: Response) => {
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

    const results = [];

    for (const body of req.body) {
      const {
        checkNo,
        checkDate,
        transactionDate,
        firm,
        amount,
        bankCode,
        type,
        //transactionId,
        projectId,
        description,
        status,
      } = body;

      const newCheck = await createCompanyCheck(
        {
          checkNo,
          checkDate,
          transactionDate,
          firm,
          amount,
          bankCode,
          type,
          //transactionId,
          projectId,
          description,
          status,
        },
        { userId, companyId },
        queryRunner.manager
      );

      results.push(newCheck);
    }

    await queryRunner.commitTransaction();
    res.status(201).json(results);
  } catch (error: any) {
    await queryRunner.rollbackTransaction();
    console.error("❌ POST company checks error:", error);
    res.status(500).json({
      errorMessage: error.message || "Çek kayıtları oluşturulamadı.",
    });
  } finally {
    await queryRunner.release();
  }
};

export const patchCompanyCheckHandler = async (
  req: Request,
  res: Response
) => {
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