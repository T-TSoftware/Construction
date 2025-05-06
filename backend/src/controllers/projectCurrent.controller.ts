// src/controllers/projectCurrent.controller.ts
import { Request, Response } from "express";
import {
  createProjectCurrent,
  getProjectCurrents,
} from "../services/projectCurrents.service";

export const postProjectCurrentHandler = async (
  req: Request,
  res: Response
) => {
  if (req.user?.role !== "superadmin") {
    res.status(403).json({ error: "Yalnızca superadmin işlem yapabilir." });
    return;
  }

  try {
    const { projectId } = req.params;
    const {
      balanceCode,
      type,
      amount,
      currency,
      transactionDate,
      description,
    } = req.body;

    if (!balanceCode || !type || !amount || !currency || !description) {
      res.status(400).json({ error: "Gerekli alanlar eksik." });
      return;
    }

    const userId = req.user.userId.toString();

    const newRecord = await createProjectCurrent(
      {
        projectId,
        balanceCode,
        type,
        amount,
        currency,
        transactionDate,
        description,
      },
      { userId }
    );

    res.status(201).json({
      message: "Cari hareket başarıyla eklendi.",
      id: newRecord.id,
    });
  } catch (error: any) {
    console.error("❌ POST project current error:", error);
    res
      .status(500)
      .json({ error: error.message || "Cari hareket oluşturulamadı." });
    return;
  }
};

export const getProjectCurrentsHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      res.status(400).json({ error: "Proje ID zorunludur." });
      return;
    }

    const currents = await getProjectCurrents(projectId);
    res.status(200).json(currents);
  } catch (error) {
    console.error("❌ GET project currents error:", error);
    res.status(500).json({ error: "Cari hareketler alınamadı." });
    return;
  }
};
