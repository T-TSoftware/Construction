import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import {
  getAllCompanyBarterAgreementItems,
  getCompanyBarterAgreementItemById,
  getCompanyBarterAgreementItemsByAgreementId,
  postCompanyBarterAgreementItem,
} from "../services/companyBarterAgreementItem.service";

export const postCompanyBarterAgreementItemHandler = async (
  req: Request,
  res: Response
) => {
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
    const { barterId } = req.params;

    const {
      direction,
      itemType,
      description,
      agreedValue,
      relatedStockCode,
      relatedSubcontractorId,
      relatedSupplierCode,
      assetDetails,
    } = req.body;

    const newItem = await postCompanyBarterAgreementItem(
      barterId,
      {
        direction,
        itemType,
        description,
        agreedValue,
        relatedStockCode,
        relatedSubcontractorId,
        relatedSupplierCode,
        assetDetails,
      },
      { userId, companyId },
      queryRunner.manager
    );

    await queryRunner.commitTransaction();
    res.status(201).json(newItem);
  } catch (error: any) {
    await queryRunner.rollbackTransaction();
    console.error("❌ POST company barter agreement item error:", error);
    res.status(500).json({
      errorMessage: error.message || "Takas kalemi oluşturulamadı.",
    });
  } finally {
    await queryRunner.release();
  }
};

export const getAllCompanyBarterAgreementItemsHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user!.userId.toString();
    const companyId = req.user!.companyId;

    const items = await getAllCompanyBarterAgreementItems(
      { userId, companyId },
      AppDataSource.manager
    );

    res.status(200).json(items);
  } catch (error: any) {
    console.error("❌ GET all agreement items error:", error);
    res.status(500).json({
      errorMessage: error.message || "Takas kalemleri alınamadı.",
    });
  }
};

export const getCompanyBarterAgreementItemsByAgreementIdHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user!.userId.toString();
    const companyId = req.user!.companyId;
    const { barterId } = req.params;

    const items = await getCompanyBarterAgreementItemsByAgreementId(
      barterId,
      { userId, companyId },
      AppDataSource.manager
    );

    res.status(200).json(items);
  } catch (error: any) {
    console.error("❌ GET agreement items by agreementId error:", error);
    res.status(500).json({
      errorMessage:
        error.message || "Takas anlaşmasına ait kalemler alınamadı.",
    });
  }
};

export const getCompanyBarterAgreementItemByIdHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user!.userId.toString();
    const companyId = req.user!.companyId;
    const { itemId } = req.params;

    const item = await getCompanyBarterAgreementItemById(
      itemId,
      { userId, companyId },
      AppDataSource.manager
    );

    res.status(200).json(item);
  } catch (error: any) {
    console.error("❌ GET agreement item by ID error:", error);
    res.status(500).json({
      errorMessage: error.message || "Takas kalemi bulunamadı.",
    });
  }
};
