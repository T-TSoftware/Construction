import { Request, Response } from "express";
import {
  createProjectSupplier,
  getProjectSuppliers,
  updateProjectSupplier,
} from "../services/projectSupplier.service";

export const postProjectSupplierHandler = async (
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
      quantityItemCode,
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

    if (!quantityItemCode || !category || !unit || !status) {
      res.status(400).json({ error: "Zorunlu alanlar eksik." });
      return;
    }

    const userId = req.user!.userId.toString();

    const newSupplier = await createProjectSupplier(
      {
        projectId,
        quantityItemCode,
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

    res.status(201).json(newSupplier);
  } catch (error) {
    console.error("❌ POST project supplier error:", error);
    res.status(500).json({ error: "Tedarikçi oluşturulamadı." });
    return;
  }
};

export const getProjectSuppliersHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { projectId } = req.params;

    const suppliers = await getProjectSuppliers(projectId);

    res.status(200).json(suppliers);
  } catch (error) {
    console.error("❌ GET project suppliers error:", error);
    res.status(500).json({ error: "Tedarikçiler alınamadı." });
    return;
  }
};

export const patchProjectSupplierHandler = async (
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

    const updatedSupplier = await updateProjectSupplier(
      projectId,
      code,
      req.body,
      { userId }
    );

    res.status(200).json(updatedSupplier);
  } catch (error: any) {
    console.error("❌ PATCH project supplier error:", error);
    const status = error.message === "Tedarikçi bulunamadı." ? 404 : 500;
    res.status(status).json({ error: error.message });
    return;
  }
};
