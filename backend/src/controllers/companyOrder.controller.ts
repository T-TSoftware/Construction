import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { createCompanyOrder } from "../services/companyOrder.service";

export const postCompanyOrderHandler = async (req: Request, res: Response) => {
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
      stockCode,
      projectCode,
      customerName,
      totalAmount,
      description,
      stockType,
    } = req.body;

    if (!stockCode || !customerName || !totalAmount) {
      res.status(400).json({
        errorMessage: "Zorunlu alanlar: stockCode, customerName, totalAmount.",
      });
      return;
    }

    const newOrder = await createCompanyOrder(
      {
        stockCode,
        projectCode,
        customerName,
        totalAmount,
        description,
        stockType,
      },
      { userId, companyId },
      queryRunner.manager
    );

    await queryRunner.commitTransaction();
    res.status(201).json(newOrder);
  } catch (error: any) {
    await queryRunner.rollbackTransaction();
    console.error("❌ POST company order error:", error);
    res.status(500).json({
      errorMessage: error.message || "Satış kaydı oluşturulamadı.",
    });
  } finally {
    await queryRunner.release();
  }
};
