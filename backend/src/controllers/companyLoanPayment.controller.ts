import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import {
  createCompanyLoanPayment,
  getCompanyLoanPaymentById,
  getCompanyLoanPayments,
} from "../services/companyLoanPayment.service";

export const postCompanyLoanPaymentHandler = async (
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
    const loanId = req.params.loanId;
    const body = req.body;

    if (!loanId || !Array.isArray(body) || body.length === 0) {
      console.log(loanId, " ");
      res.status(400).json({
        errorMessage: "loanCode parametresi ve body array zorunludur.",
      });
      return;
    }

    const results = [];

    for (const item of body) {
      const newPayment = await createCompanyLoanPayment(
        { ...item, loanId },
        { userId, companyId },
        queryRunner.manager
      );
      results.push(newPayment);
    }

    await queryRunner.commitTransaction();
    res.status(201).json(results);
  } catch (error: any) {
    await queryRunner.rollbackTransaction();
    console.error("❌ POST company loan payments error:", error);
    res.status(500).json({
      errorMessage: error.message || "Loan ödemeleri kaydedilemedi.",
    });
  } finally {
    await queryRunner.release();
  }
};

export const getCompanyLoanPaymentsHandler = async (
  req: Request,
  res: Response
) => {
  /*if (req.user?.role !== "superadmin") {
    res
      .status(403)
      .json({ errorMessage: "Yalnızca superadmin işlem yapabilir." });
    return;
  }*/

  try {
    const userId = req.user!.userId.toString();
    const companyId = req.user!.companyId;

    const loanPayments = await getCompanyLoanPayments(
      { userId, companyId },
      AppDataSource.manager
    );

    res.status(200).json({ loanPayments });
  } catch (error: any) {
    console.error("❌ GET loans transactions error:", error);
    res.status(500).json({
      errorMessage: error.message || "Çekler getirilemedi.",
    });
  }
};

export const getCompanyLoanPaymentByIdHandler = async (
  req: Request,
  res: Response
) => {
  if (req.user?.role !== "superadmin") {
    res.status(403).json({ error: "Yalnızca superadmin işlem yapabilir." });
    return;
  }

  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: "loan payment ID zorunludur." });
      return;
    }

    const userId = req.user!.userId.toString();
    const companyId = req.user!.companyId;

    const loanPayment = await getCompanyLoanPaymentById(id, {
      userId,
      companyId,
    });
    res.status(200).json(loanPayment);
  } catch (error: any) {
    console.error("❌ GET loan by ID error:", error);
    res.status(500).json({ error: error.message || "Çek bilgisi alınamadı." });
  }
};
