import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import {
  createCompanyStock,
  getCompanyStocks,
  updateCompanyStock,
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

    const results = [];

    for (const body of req.body) {
      const {
        projectId,
        //stockItemId, // ✅ stockItemId artık zorunlu
        //code,
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
          //stockItemId, // ✅ stockItemId artık zorunlu
          //code,
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

      results.push(newStock);
    }

    await queryRunner.commitTransaction();
    res.status(201).json(results);
  } catch (error: any) {
    await queryRunner.rollbackTransaction();
    console.error("❌ POST company stock error:", error);
    res.status(500).json({
      errorMessage: error.message || "Stok kayıtları oluşturulamadı.",
    });
    return;
  } finally {
    await queryRunner.release();
  }
};

export const patchCompanyStockHandler = async (req: Request, res: Response) => {
  // ✅ Sadece superadmin güncelleme yapabilir
  if (req.user?.role !== "superadmin") {
    res
      .status(403)
      .json({ errorMessage: "Yalnızca superadmin işlemi yapabilir." });
    return;
  }

  try {
    const { code } = req.params;
    const userId = req.user!.userId.toString();
    const companyId = req.user!.companyId;

    const updatedStock = await updateCompanyStock(code, req.body, {
      userId,
      companyId,
    });

    res.status(200).json(updatedStock);
  } catch (error: any) {
    console.error("❌ PATCH company stock error:", error);
    const status = error.message === "Stok kaydı bulunamadı." ? 404 : 500;
    res.status(status).json({ errorMessage: error.message });
    return;
  }
};

export const patchCompanyStocksHandler = async (
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

    const results = [];

    for (const body of req.body) {
      const { code, ...updateFields } = body;

      const updatedStock = await updateCompanyStock(
        code,
        updateFields,
        {
          userId,
          companyId,
        },
        queryRunner.manager
      );

      results.push(updatedStock);
    }

    await queryRunner.commitTransaction();
    res.status(200).json(results);
  } catch (error: any) {
    await queryRunner.rollbackTransaction();
    console.error("❌ PATCH company stocks error:", error);
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
