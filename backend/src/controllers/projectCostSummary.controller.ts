import { Request, Response } from "express";
import { getProjectCostSummary } from "../services/projectCostSummary.service";

export const getProjectCostSummaryHandler = async (
  req: Request,
  res: Response
) => {
  if (req.user?.role !== "superadmin") {
    res.status(403).json({ error: "Yalnızca superadmin işlem yapabilir." });
    return;
  }
  try {
    const { projectId } = req.params;
    if (!projectId) {
      res.status(400).json({ error: "projectId parametresi zorunludur." });
      return;
    }
    const summary = await getProjectCostSummary(projectId);
    res.status(200).json(summary);
  } catch (error) {
    console.error("❌ GET cost summary error:", error);
    res.status(500).json({ error: "Maliyet özeti alınamadı." });
  }
};
