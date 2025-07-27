import { Request, Response } from "express";
import {
  createEstimatedCost,
  getEstimatedCostsByProject,
} from "../services/projectEstimatedCost.service";

export const postEstimatedCostHandler = async (req: Request, res: Response) => {
  if (req.user?.role !== "superadmin") {
    res.status(403).json({ error: "Yalnızca superadmin işlemi yapabilir." });
    return;
  }
  try {
    const { projectId } = req.params;
    const { name, category, description, unit, unitPrice, quantity } = req.body;

    const userId = req.user!.userId.toString();
    const companyId = req.user!.companyId;

    const newEstimatedCost = await createEstimatedCost(
      {
        projectId,
        name,
        category,
        description,
        unit,
        unitPrice,
        quantity,
      },
      {
        userId,
        companyId,
      }
    );

    res.status(201).json(newEstimatedCost);
  } catch (error) {
    console.error("❌ POST estimated cost error:", error);
    res.status(500).json({ error: "Tahmini maliyet oluşturulamadı." });
  }
};

export const getEstimatedCostsByProjectHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { projectId } = req.params;
    const userId = req.user!.userId.toString();
    const companyId = req.user!.companyId;

    const estimatedCosts = await getEstimatedCostsByProject(projectId, {
      userId,
      companyId,
    });

    res.status(200).json(estimatedCosts);
  } catch (error) {
    console.error("❌ GET estimated costs error:", error);
    res.status(500).json({ error: "Hesaplanan maliyetler alınamadı." });
  }
};
