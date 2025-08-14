import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import {
  createCompanyStock,
  getCompanyStocks,
  updateCompanyStock,
  getCompanyStockById
} from "../services/companyStock.service";

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

    const {
      projectId,
      name,
      category,
      description,
      unit,
      quantity,
      minimumQuantity,
      location,
      stockDate,
    } = req.body;

    const newStock = await createCompanyStock(
      {
        projectId,
        name,
        category,
        description,
        unit,
        quantity,
        minimumQuantity,
        location,
        stockDate,
      },
      { userId, companyId },
      queryRunner.manager
    );

    await queryRunner.commitTransaction();
    res.status(201).json(newStock);
  } catch (error: any) {
    await queryRunner.rollbackTransaction();
    console.error("❌ POST company stock error:", error);
    res.status(500).json({
      errorMessage: error.message || "Stok kaydı oluşturulamadı.",
    });
  } finally {
    await queryRunner.release();
  }
};

export const patchCompanyStockHandler = async (
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
    const id = req.params.id

    const updatedStock = await updateCompanyStock(
      id,
      req.body,
      {
        userId,
        companyId,
      },
      queryRunner.manager
    );

    await queryRunner.commitTransaction();
    res.status(200).json(updatedStock);
  } catch (error: any) {
    await queryRunner.rollbackTransaction();
    console.error("❌ PATCH company stock error:", error);
    res
      .status(400)
      .json({ errorMessage: error.message || "Stok güncellenemedi." });
  } finally {
    await queryRunner.release();
  }
};

export const getCompanyStocksHandler = async (req: Request, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const stocks = await getCompanyStocks(companyId);
    res.status(200).json(stocks);
  } catch (error) {
    console.error("❌ GET company stocks error:", error);
    res.status(500).json({ errorMessage: "Stok listesi alınamadı." });
  }
};

export const getCompanyStockByIdHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId.toString();
    const companyId = req.user!.companyId;

    const stock = await getCompanyStockById(id, { userId, companyId });

    res.status(200).json(stock);
  } catch (error) {
    console.error("❌ GET project suppliers error:", error);
    res.status(500).json({ error: "Tedarikçiler alınamadı." });
    return;
  }
};
