import { Request, Response } from "express";
import {
  createProjectQuantity,
  getProjectQuantities,
} from "../services/projectQuantity.service";
import { AppDataSource } from "../config/data-source";

export const postProjectQuantityHandler = async (
  req: Request,
  res: Response
) => {
  if (req.user?.role !== "superadmin") {
    res.status(403).json({ error: "Yalnızca superadmin işlem yapabilir." });
    return;
  }

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const { projectId } = req.params;
    const { quantityItemCode, quantity, unit, description, category } =
      req.body;

    if (!quantity || !unit) {
      res.status(400).json({ error: "Gerekli alanlar eksik." });
      return;
    }

    const userId = req.user!.userId.toString();
    const companyId = req.user!.companyId;

    const newRecord = await createProjectQuantity(
      projectId,
      {
        quantityItemCode,
        quantity,
        unit,
        description,
        category,
      },
      { userId, companyId },
      queryRunner.manager
    );

    await queryRunner.commitTransaction();
    res.status(201).json({ newRecord });
  } catch (error: any) {
    await queryRunner.rollbackTransaction();
    console.error("❌ POST project quantity error:", error);
    res.status(500).json({
      errorMessage: error.message || "Metraj kaydı oluşturulamadı.",
    });
  } finally {
    await queryRunner.release();
  }
};

export const getProjectQuantitiesHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { projectId } = req.params;
    const userId = req.user!.userId.toString();
    const companyId = req.user!.companyId;

    if (!projectId) {
      res.status(400).json({ error: "projectId parametresi zorunludur." });
      return;
    }

    const result = await getProjectQuantities(projectId, { userId, companyId });
    res.status(200).json(result);
  } catch (error) {
    console.error("❌ GET project quantities error:", error);
    res.status(500).json({ error: "Metrajlar alınamadı." });
    return;
  }
};
