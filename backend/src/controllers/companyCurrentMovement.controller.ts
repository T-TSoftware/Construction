import { Request, Response } from "express";
import { getCurrentMovements } from "../services/companyCurrentMovement.service";

export const getCurrentMovementsHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const companyId = req.user?.companyId;

    if (!companyId) {
      res.status(403).json({ errorMessage: "Şirket bilgisi bulunamadı." });
      return;
    }

    const filters = req.query;

    const data = await getCurrentMovements(
      { companyId },
      filters as {
        project?: string;
        transactiondate?: string;
        description?: string;
        firm?: string;
        income?: number;
        expense?: number;
        invoiceyn?: "Y" | "N";
        //invoicecode?: string;
        category?: string;
        //checkcode?: string;
        startDate?: string;
        endDate?: string;
      }
    );

    res.status(200).json(data);
  } catch (error: any) {
    console.error("❌ [getCurrentMovementsHandler] Error:", error);
    res.status(500).json({
      errorMessage: error.message || "Cari hareketler alınamadı.",
    });
  }
};
