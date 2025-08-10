import { Request, Response } from "express";
import {
  createProjectSupplier,
  getProjectSuppliers,
  updateProjectSupplier,
  getProjectSupplierById,
} from "../services/projectSupplier.service";
import { AppDataSource } from "../config/data-source"; // transaction için gerekli

export const postProjectSupplierHandler = async (
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
    const userId = req.user!.userId.toString();
    const companyId = req.user!.companyId;

    const {
      category,
      companyName,
      unit,
      unitPrice,
      quantity,
      contractAmount,
      status,
      description,
      projectQuantityId,
      addedFromQuantityYN,
    } = req.body;

    const newSupplier = await createProjectSupplier(
      {
        projectId,
        category,
        companyName,
        unit,
        unitPrice,
        quantity,
        contractAmount,
        status,
        description,
        projectQuantityId,
        addedFromQuantityYN,
      },
      { userId, companyId },
      queryRunner.manager
    );

    await queryRunner.commitTransaction();
    res.status(201).json(newSupplier);
  } catch (error: any) {
    await queryRunner.rollbackTransaction();
    console.error("❌ POST project supplier error:", error);
    res.status(500).json({
      error: error.message || "Tedarikçi oluşturulamadı.",
    });
  } finally {
    await queryRunner.release();
  }
};

export const getProjectSuppliersHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { projectId } = req.params;
    const userId = req.user!.userId.toString();
    const companyId = req.user!.companyId;

    const suppliers = await getProjectSuppliers(projectId, {
      userId,
      companyId,
    });

    res.status(200).json(suppliers);
  } catch (error) {
    console.error("❌ GET project suppliers error:", error);
    res.status(500).json({ error: "Tedarikçiler alınamadı." });
    return;
  }
};

export const getProjectSupplierByIdHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId.toString();
    const companyId = req.user!.companyId;

    const supplier = await getProjectSupplierById(id, { userId, companyId });

    res.status(200).json(supplier);
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

    // 💡 Route'u mümkünse /projects/:projectId/suppliers/:id yapın.
    // Aşağıda supplier id'yi alıyoruz:
    const { id } = req.params; // supplier id
    const updateData = req.body; // tek obje

    const updated = await updateProjectSupplier(
      id,
      updateData,
      { userId, companyId },
      queryRunner.manager
    );

    await queryRunner.commitTransaction();
    res.status(200).json(updated);
  } catch (error: any) {
    await queryRunner.rollbackTransaction();
    console.error("❌ PATCH project supplier error:", error);
    res.status(500).json({
      errorMessage: error.message || "Tedarikçi güncellenemedi.",
    });
  } finally {
    await queryRunner.release();
  }
};
// multiple patch will be added according to business needs...
