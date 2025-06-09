import { Request, Response } from "express";
import { getProjectCostSummary } from "../services/projectCostSummary.service";

export const getProjectCostSummaryHandler = async (
  req: Request,
  res: Response
) => {

  try {
    const { projectId } = req.params;
    if (!projectId) {
      res.status(400).json({ error: "projectId parametresi zorunludur." });
      return;
    }

    const { quantityItemCode, overlimitYn } = req.query;

    const summary = await getProjectCostSummary(
      projectId,
      { companyId: req.user!.companyId },
      {
        quantityItemCode: quantityItemCode as string,
        overlimitYn: overlimitYn as string
      }
    );

    res.status(200).json(summary);
  } catch (error) {
    console.error("❌ GET cost summary error:", error);
    res.status(500).json({ error: "Maliyet özeti alınamadı." });
  }
};
