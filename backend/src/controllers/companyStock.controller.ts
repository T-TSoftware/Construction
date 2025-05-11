import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { createCompanyStock } from "../services/companyStock.service";

export const postCompanyStockHandler = async (req: Request, res: Response) => {
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
        projectId,
        code,
        name,
        category,
        description,
        unit,
        quantity,
        minimumQuantity,
        location,
        stockDate,
      } = body;

      const newStock = await createCompanyStock(
        {
          projectId,
          code,
          name,
          category,
          description,
          unit,
          quantity,
          minimumQuantity,
          location,
          stockDate,
        },
        { userId, companyId }
      );

      results.push(newStock);
    }

    await queryRunner.commitTransaction();
    res.status(201).json(results);
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error("❌ POST company stock error:", error);
    res.status(500).json({ errorMessage: "Stok kayıtları oluşturulamadı." });
    return;
  } finally {
    await queryRunner.release();
  }
};
