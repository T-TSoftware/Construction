import { Request, Response } from "express";
import {
  getUpcomingPayments,
  getUpcomingCollections,
} from "../services/companyUpcomingTransaction.service";

export const getUpcomingPaymentsHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      res
        .status(403)
        .json({ errorMessage: "Geçerli şirket bilgisi bulunamadı." });
      return;
    }

    const { startDate, endDate } = req.query;

    const result = await getUpcomingPayments(
      { companyId },
      {
        startDate: startDate as string,
        endDate: endDate as string,
      }
    );

    res.status(200).json(result);
  } catch (error: any) {
    console.error("❌ GET upcoming payments error:", error);
    res.status(500).json({
      errorMessage: "Yaklaşan ödeme verileri alınamadı.",
      detail: error.message,
    });
  }
};

export const getUpcomingCollectionsHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      res
        .status(403)
        .json({ errorMessage: "Geçerli şirket bilgisi bulunamadı." });
      return;
    }

    const { startDate, endDate } = req.query;

    const result = await getUpcomingCollections(
      { companyId },
      {
        startDate: startDate as string,
        endDate: endDate as string,
      }
    );

    res.status(200).json(result);
  } catch (error: any) {
    console.error("❌ GET upcoming collections error:", error);
    res.status(500).json({
      errorMessage: "Yaklaşan tahsilat verileri alınamadı.",
      detail: error.message,
    });
  }
};
