import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { createCompanyCheck } from "../services/companyCheck.service";

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
