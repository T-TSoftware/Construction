import { Request, Response } from "express";
import {
  createProjectSubcontractor,
  getProjectSubcontractors,
  updateProjectSubcontractor,
} from "../services/projectSubcontractor.service";

export const postProjectSubcontractorHandler = async (
  req: Request,
  res: Response
) => {
  if (req.user?.role !== "superadmin") {
    res.status(403).json({ error: "Yalnızca superadmin işlemi yapabilir." });
    return;
  }
  try {
    const { projectId } = req.params;
    const {
      category,
      companyName,
      unit,
      unitPrice,
      quantity,
      contractAmount,
      paidAmount,
      status,
      description,
    } = req.body;

    if (!category) {
      res.status(400).json({ error: "Kategori zorunludur." });
      return;
    }

    const userId = req.user!.userId.toString();

    const newSubcontractor = await createProjectSubcontractor(
      {
        projectId,
        category,
        companyName,
        unit,
        unitPrice,
        quantity,
        contractAmount,
        paidAmount,
        status,
        description,
      },
      { userId }
    );

    res.status(201).json(newSubcontractor);
  } catch (error) {
    console.error("❌ POST project subcontractor error:", error);
    res.status(500).json({ error: "Tedarikçi oluşturulamadı." });
    return;
  }
};

export const getProjectSubcontractorsHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { projectId } = req.params;

    const subcontractors = await getProjectSubcontractors(projectId);

    res.status(200).json(subcontractors);
  } catch (error) {
    console.error("❌ GET project subcontractors error:", error);
    res.status(500).json({ error: "Tedarikçiler alınamadı." });
    return;
  }
};

export const patchProjectSubcontractorHandler = async (
  req: Request,
  res: Response
) => {
  if (req.user?.role !== "superadmin") {
    res.status(403).json({ error: "Yalnızca superadmin işlemi yapabilir." });
    return;
  }

  try {
    const { projectId, code } = req.params;
    const userId = req.user!.userId.toString();

    const updatedSubcontractor = await updateProjectSubcontractor(
      projectId,
      code,
      req.body,
      { userId }
    );

    res.status(200).json(updatedSubcontractor);
  } catch (error: any) {
    console.error("❌ PATCH project subcontractor error:", error);
    const status = error.message === "Tedarikçi bulunamadı." ? 404 : 500;
    res.status(status).json({ error: error.message });
    return;
  }
};
