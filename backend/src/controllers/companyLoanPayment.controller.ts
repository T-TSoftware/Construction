import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { CompanyLoanPayment } from "../entities/CompanyLoanPayment";
import { parse } from "json2csv";
import {
  createCompanyLoanPayment,
  exportCompanyLoanPaymentsToCsv,
  exportCompanyLoanPaymentsToPdf,
  getCompanyLoanPaymentById,
  getCompanyLoanPayments,
  getCompanyLoanPaymentsByLoanId,
  updateCompanyLoanPayment,
} from "../services/companyLoanPayment.service";
import fs from "fs";
import path from "path";

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
        loanId,
        { ...item },
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

export const patchCompanyLoanPaymentHandler = async (
  req: Request,
  res: Response
) => {
  // 🔒 Yetki kontrolü
  if (req.user?.role !== "superadmin") {
    res.status(403).json({
      errorMessage: "Yalnızca superadmin işlem yapabilir.",
    });
    return;
  }

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const userId = req.user!.userId.toString();
    const companyId = req.user!.companyId;
    const id = req.params.id;
    const body = req.body;

    // 📌 Parametreden gelen 'id' kontrolü
    if (!id || typeof id !== "string") {
      throw new Error("Geçerli bir 'id' parametresi gereklidir.");
    }

    // 🔁 Taksit güncelleme işlemi
    await updateCompanyLoanPayment(
      id,
      body,
      { userId, companyId },
      queryRunner.manager
    );

    await queryRunner.commitTransaction();
    res.status(200).json({ message: "Taksit başarıyla güncellendi." });
    return;
  } catch (error: any) {
    await queryRunner.rollbackTransaction();
    console.error("❌ PATCH loanPayment update error:", error);
    res.status(400).json({
      errorMessage: error.message || "Taksit güncellenemedi.",
    });
    return;
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

export const getCompanyLoanPaymentsByLoanIdHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user!.userId.toString();
    const companyId = req.user!.companyId;

    const loanId = req.params.loanId;
    if (!loanId) {
      res.status(400).json({ errorMessage: "Loan ID zorunludur." });
      return;
    }

    const loanPayments = await getCompanyLoanPaymentsByLoanId(
      loanId,
      { userId, companyId },
      AppDataSource.manager
    );

    res.status(200).json({ loanPayments });
  } catch (error: any) {
    console.error("❌ GET loan payments by loanId error:", error);
    res.status(500).json({
      errorMessage: error.message || "Loan ödemeleri getirilemedi.",
    });
  }
};

export const exportLoanPaymentsHandler = async (
  req: Request,
  res: Response
) => {
  const userId = req.user!.userId.toString();
  const companyId = req.user!.companyId;
  const data = await getCompanyLoanPayments({ userId, companyId }); // ✅ Doğru parametre tipi

  const csv = await exportCompanyLoanPaymentsToCsv(data);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=loan-payments.csv"
  );
  res.send(csv);
};

export const exportLoanPaymentsPdfHandler = async (
  req: Request,
  res: Response
) => {
  const userId = req.user!.userId.toString();
  const companyId = req.user!.companyId;

  const data = await getCompanyLoanPayments({ userId, companyId });
  const pdfBuffer = await exportCompanyLoanPaymentsToPdf(data);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=loan-payments.pdf"
  );
  res.send(pdfBuffer);
};
