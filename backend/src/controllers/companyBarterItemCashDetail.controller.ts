import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import {
  createCompanyBarterCashDetail,
  getCompanyBarterCashDetailsByItemId,
  updateCompanyBarterCashDetail,
} from "../services/companyBarterItemCashDetail.service";

export const postCompanyBarterCashDetailsHandler = async (
  req: Request,
  res: Response
) => {
  if (req.user?.role !== "superadmin") {
    res.status(403).json({
      errorMessage: "Yalnızca superadmin işlemi yapabilir.",
    });
    return;
  }

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const userId = req.user!.userId.toString();
    const companyId = req.user!.companyId;
    const barterItemId = req.params.barterItemId;

    const results = [];

    for (const body of req.body) {
      const data = {
        barterItemId,
        amount: body.amount,
        currency: body.currency,
        fromAccountId: body.fromAccountId,
        accountType: body.accountType,
        status: body.status,
        description: body.description,
      };

      const cashDetail = await createCompanyBarterCashDetail(
        data,
        { userId, companyId },
        queryRunner.manager
      );

      results.push(cashDetail);
    }

    await queryRunner.commitTransaction();
    res.status(201).json(results);
  } catch (error: any) {
    await queryRunner.rollbackTransaction();
    console.error("❌ POST barter cash details error:", error);
    res.status(500).json({
      errorMessage: error.message || "Cash detail kayıtları oluşturulamadı.",
    });
  } finally {
    await queryRunner.release();
  }
};

export const patchCompanyBarterCashDetailsHandler = async (
  req: Request,
  res: Response
) => {
  if (req.user?.role !== "superadmin") {
    res.status(403).json({
      errorMessage: "Yalnızca superadmin işlemi yapabilir.",
    });
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
      const data = {
        amount: body.amount,
        currency: body.currency,
        fromAccountId: body.fromAccountId,
        accountType: body.accountType,
        status: body.status,
        paymentDate: body.paymentDate,
        description: body.description,
      };

      const updatedCashDetail = await updateCompanyBarterCashDetail(
        body.id, // 🔧 doğru parametre bu
        data,
        { userId, companyId },
        queryRunner.manager
      );

      results.push(updatedCashDetail);
    }

    await queryRunner.commitTransaction();
    res.status(200).json(results);
  } catch (error: any) {
    await queryRunner.rollbackTransaction();
    console.error("❌ PATCH barter cash details error:", error);
    res.status(500).json({
      errorMessage: error.message || "Cash detail kayıtları güncellenemedi.",
    });
  } finally {
    await queryRunner.release();
  }
};

export const getCompanyBarterCashDetailsByItemIdHandler = async (
  req: Request,
  res: Response
) => {
  try {
    // Kullanıcı bilgilerini al
    const userId = req.user!.userId.toString();
    const companyId = req.user!.companyId;
    const barterItemId = req.params.barterItemId;

    // Cash Detail'leri getir
    const details = await getCompanyBarterCashDetailsByItemId(barterItemId, {
      userId,
      companyId,
    });

    res.status(200).json(details);
  } catch (error: any) {
    console.error("❌ GET barter cash details error:", error);
    res.status(500).json({
      errorMessage: error.message || "Cash detail kayıtları alınamadı.",
    });
  }
};
