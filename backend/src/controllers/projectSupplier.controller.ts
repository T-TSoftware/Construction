import { Request, Response } from "express";
import {
  createProjectSupplier,
  getProjectSuppliers,
  updateProjectSupplier,
} from "../services/projectSupplier.service";
import { AppDataSource } from "../config/data-source"; // transaction için gerekli

/*export const postProjectSupplierHandler = async (
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
};*/

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
  await queryRunner.startTransaction(); // 🔁 transaction başlatılır

  try {
    const { projectId } = req.params;
    const userId = req.user!.userId.toString();

    // 🔁 Artık her zaman array geleceği için döngüyle ilerliyoruz
    const results = [];

    for (const body of req.body) {
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
      } = body;

      // ❗ Her item için zorunlu alan kontrolü
      /*if (!quantityItemCode || !category || !unit || !status) {
        res.status(400).json({ error: "Zorunlu alanlar eksik." });
        return;
      }*/
      if (!quantityItemCode || !category || !unit || !status) {
        throw new Error("Zorunlu alanlar eksik."); // ❌ Hata fırlat → transaction rollback
      }

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

      results.push(newSupplier);
    }
    await queryRunner.commitTransaction(); // ✅ Hepsi başarılıysa commit
    res.status(201).json(results);
  } catch (error) {
    await queryRunner.rollbackTransaction(); // ❌ Hata varsa tüm kayıtlar geri alınır
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

// multiple patch will be added according to business needs...
