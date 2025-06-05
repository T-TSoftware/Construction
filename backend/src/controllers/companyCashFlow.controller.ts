import { Request, Response } from "express";
import { getDailyCashflow } from "../services/companyCashFlow.service";

export const getDailyCashflowHandler = async (req: Request, res: Response) => {
  try {
    // 👤 Kullanıcıdan şirket bilgisi al
    const companyId = req.user?.companyId;
    if (!companyId) {
      res
        .status(403)
        .json({ errorMessage: "Geçerli şirket bilgisi bulunamadı." });
      return;
    }

    // 📆 Query parametrelerini oku
    const { startDate, endDate, method, transactionDate } = req.query;

    // 🧠 View'den günlük nakit akışı verilerini al
    const result = await getDailyCashflow(
      { companyId },
      {
        startDate: startDate as string,
        endDate: endDate as string,
        method: method as string,
        transactionDate: transactionDate as string,
      }
    );

    // ✅ Yanıtla
    res.status(200).json(result);
  } catch (error: any) {
    console.error("❌ GET daily cashflow error:", error);
    res.status(500).json({
      errorMessage: "Nakit akışı verileri alınamadı.",
      detail: error.message,
    });
  }
};
