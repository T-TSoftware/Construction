import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import {
  createCompanyLoan,
  getCompanyLoanById,
  getCompanyLoans,
} from "../services/companyLoan.service";

export const postCompanyLoanHandler = async (req: Request, res: Response) => {
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
      code,
      name,
      accountNo,
      bankId,
      projectId,
      totalAmount,
      remainingPrincipal,
      remainingInstallmentAmount,
      currency,
      interestRate,
      totalInstallmentCount,
      remainingInstallmentCount,
      loanDate,
      purpose,
      loanType,
      status,
      description,
    } = req.body;

    const newLoan = await createCompanyLoan(
      {
        code,
        name,
        accountNo,
        bankId,
        projectId,
        totalAmount,
        remainingPrincipal,
        remainingInstallmentAmount,
        currency,
        interestRate,
        totalInstallmentCount,
        remainingInstallmentCount,
        loanDate,
        purpose,
        loanType,
        status,
        description,
      },
      { userId, companyId },
      queryRunner.manager
    );

    await queryRunner.commitTransaction();
    res.status(201).json(newLoan);
  } catch (error: any) {
    await queryRunner.rollbackTransaction();
    console.error("❌ POST company loan error:", error);
    res.status(500).json({
      errorMessage: error.message || "Kredi kaydı oluşturulamadı.",
    });
  } finally {
    await queryRunner.release();
  }
};

export const getCompanyLoansHandler = async (req: Request, res: Response) => {
  /*if (req.user?.role !== "superadmin") {
    res
      .status(403)
      .json({ errorMessage: "Yalnızca superadmin işlem yapabilir." });
    return;
  }*/

  try {
    const userId = req.user!.userId.toString();
    const companyId = req.user!.companyId;

    const loans = await getCompanyLoans(
      { userId, companyId },
      AppDataSource.manager
    );

    res.status(200).json({ loans });
  } catch (error: any) {
    console.error("❌ GET loans transactions error:", error);
    res.status(500).json({
      errorMessage: error.message || "Çekler getirilemedi.",
    });
  }
};

export const getCompanyLoanByIdHandler = async (
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
      res.status(400).json({ error: "loan ID zorunludur." });
      return;
    }

    const userId = req.user!.userId.toString();
    const companyId = req.user!.companyId;

    const loan = await getCompanyLoanById(id, { userId, companyId });
    res.status(200).json(loan);
  } catch (error: any) {
    console.error("❌ GET loan by ID error:", error);
    res.status(500).json({ error: error.message || "Çek bilgisi alınamadı." });
  }
};
