import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { createCompanyOrder, getCompanyOrderById, getCompanyOrders,getCompanyOrdersByProjectId } from "../services/companyOrder.service";

export const postCompanyOrderHandler = async (req: Request, res: Response) => {
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
      stockId,
      projectId,
      customerName,
      totalAmount,
      description,
      stockType,
    } = req.body;


    const newOrder = await createCompanyOrder(
      {
        stockId,
        projectId,
        customerName,
        totalAmount,
        description,
        stockType,
      },
      { userId, companyId },
      queryRunner.manager
    );

    await queryRunner.commitTransaction();
    res.status(201).json(newOrder);
  } catch (error: any) {
    await queryRunner.rollbackTransaction();
    console.error("❌ POST company order error:", error);
    res.status(500).json({
      errorMessage: error.message || "Satış kaydı oluşturulamadı.",
    });
  } finally {
    await queryRunner.release();
  }
};

export const getCompanyOrdersHandler = async (req: Request, res: Response) => {
  /*if (req.user?.role !== "superadmin") {
    res
      .status(403)
      .json({ errorMessage: "Yalnızca superadmin işlem yapabilir." });
    return;
  }*/

  try {
    const userId = req.user!.userId.toString();
    const companyId = req.user!.companyId;

    const orders = await getCompanyOrders(
      { userId, companyId },
      AppDataSource.manager
    );

    res.status(200).json({ orders });
  } catch (error: any) {
    console.error("❌ GET orders transactions error:", error);
    res.status(500).json({
      errorMessage: error.message || "Satışlar getirilemedi.",
    });
  }
};

export const getCompanyOrderByIdHandler = async (req: Request, res: Response) => {
  if (req.user?.role !== "superadmin") {
    res.status(403).json({ error: "Yalnızca superadmin işlem yapabilir." });
    return;
  }

  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: "Check ID zorunludur." });
      return;
    }

    const userId = req.user!.userId.toString();
    const companyId = req.user!.companyId;

    const order = await getCompanyOrderById(id, { userId, companyId });
    res.status(200).json(order);
  } catch (error: any) {
    console.error("❌ GET order by ID error:", error);
    res.status(500).json({ error: error.message || "Satış bilgisi alınamadı." });
  }
};

export const getCompanyOrdersByProjectIdHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { projectId } = req.params;
    const userId = req.user!.userId.toString();
    const companyId = req.user!.companyId;

    const orders = await getCompanyOrdersByProjectId(projectId, {
      userId,
      companyId,
    });

    res.status(200).json(orders);
  } catch (error) {
    console.error("❌ GET project suppliers error:", error);
    res.status(500).json({ error: "Tedarikçiler alınamadı." });
    return;
  }
};