import { Request, Response } from "express";
import {
  createProjectQuantity,
  getProjectQuantities,
} from "../services/projectQuantity.service";

export const postProjectQuantityHandler = async (
  req: Request,
  res: Response
) => {
  if (req.user?.role !== "superadmin") {
    res.status(403).json({ error: "Yalnızca superadmin işlem yapabilir." });
    return;
  }

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
      {
        projectId,
        quantityItemCode,
        quantity,
        unit,
        description,
        category,
      },
      { userId, companyId }
    );

    res.status(201).json({
      message: "Metraj başarıyla eklendi.",
      id: newRecord.id,
    });
  } catch (error: any) {
    console.error("❌ POST project quantity error:", error);
    res
      .status(500)
      .json({ error: error.message || "Metraj kaydı oluşturulamadı." });
    return;
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
