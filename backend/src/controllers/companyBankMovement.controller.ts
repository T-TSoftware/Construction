import { Request, Response } from "express";
import { getBankMovements } from "../services/companyBankMovement.service";

export const getBankMovementsHandler = async (req: Request, res: Response) => {
  try {
    const result = await getBankMovements(req.query as any);
    res.status(200).json(result);
  } catch (error) {
    console.error("❌ Error fetching bank movements:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};