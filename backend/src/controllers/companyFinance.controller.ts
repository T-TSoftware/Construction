import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import {
  //createCompanyFinanceTransaction,
  //updateCompanyFinanceTransaction,
  getCompanyFinanceTransactions,
  getCompanyFinanceTransactionById,
  deleteCompanyFinanceTransactionById,
} from "../services/companyFinance.service";
import {
  createCompanyFinanceTransaction,
  updateCompanyFinanceTransaction,
  updateCompanyFinanceTransactionNew,
} from "../services/companyFinanceTransaction.service";

export const postCompanyFinanceTransactionHandler = async (
  req: Request,
  res: Response
) => {
  if (req.user?.role !== "superadmin") {
    res
      .status(403)
      .json({ errorMessage: "Yalnızca superadmin işlem yapabilir." });
    return;
  }

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const userId = req.user!.userId.toString();
    const companyId = req.user!.companyId;

    const {
      type,
      amount,
      currency,
      fromAccountCode,
      toAccountCode,
      targetType,
      targetId,
      targetName,
      transactionDate,
      method,
      category,
      invoiceYN,
      invoiceCode,
      referenceCode,
      description,
      projectId,
      source,
    } = req.body;

    const transaction = await createCompanyFinanceTransaction(
      {
        type,
        amount,
        currency,
        fromAccountCode,
        toAccountCode,
        targetType,
        targetId,
        targetName,
        transactionDate,
        method,
        category,
        invoiceYN,
        invoiceCode,
        referenceCode,
        description,
        projectId,
        source,
      },
      { userId, companyId },
      queryRunner.manager
    );

    await queryRunner.commitTransaction();
    res.status(201).json({ transaction });
  } catch (error: any) {
    await queryRunner.rollbackTransaction();
    console.error("❌ POST company finance transaction error:", error);
    res.status(500).json({
      errorMessage: error.message || "Finansal işlem(ler) oluşturulamadı.",
    });
  } finally {
    await queryRunner.release();
  }
};

export const patchCompanyFinanceTransactionHandler = async (
  req: Request,
  res: Response
) => {
  if (req.user?.role !== "superadmin") {
    res
      .status(403)
      .json({ errorMessage: "Yalnızca superadmin işlem yapabilir." });
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
    console.log(req.body);
    if (!id || typeof id !== "string") {
      throw new Error("Geçerli bir 'code' parametresi gereklidir.");
    }

    const updatedTransaction = await updateCompanyFinanceTransactionNew(
      id,
      body,
      { userId, companyId },
      queryRunner.manager
    );

    await queryRunner.commitTransaction();
    res.status(200).json(updatedTransaction);
    return;
  } catch (error: any) {
    await queryRunner.rollbackTransaction();
    console.error("❌ PATCH finance transaction error:", error);
    res.status(400).json({
      errorMessage: error.message || "Finansal işlem güncellenemedi.",
    });
    return;
  } finally {
    await queryRunner.release();
  }
};

export const getCompanyFinanceTransactionsHandler = async (
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

    const transactions = await getCompanyFinanceTransactions(
      { userId, companyId },
      AppDataSource.manager
    );

    res.status(200).json({ transactions });
  } catch (error: any) {
    console.error("❌ GET finance transactions error:", error);
    res.status(500).json({
      errorMessage: error.message || "Finansal işlemler getirilemedi.",
    });
  }
};

export const getCompanyFinanceTransactionByIdHandler = async (
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
      res.status(400).json({ error: "Transaction ID zorunludur." });
      return;
    }

    const userId = req.user!.userId.toString();
    const companyId = req.user!.companyId;

    const transaction = await getCompanyFinanceTransactionById(id, {
      userId,
      companyId,
    });

    res.status(200).json(transaction);
  } catch (error: any) {
    console.error("❌ GET finance transaction by ID error:", error);
    res.status(500).json({
      error: error.message || "Finansal işlem bilgisi alınamadı.",
    });
  }
};

// 📌 Silme – Sadece superadmin
export const deleteCompanyFinanceTransactionByIdHandler = async (
  req: Request,
  res: Response
) => {
  if (req.user?.role !== "superadmin") {
    res.status(403).json({ errorMessage: "Yalnızca superadmin işlem yapabilir." });
    return;
  }

  const qr = AppDataSource.createQueryRunner();
  await qr.connect();
  await qr.startTransaction();

  try {
    const { id } = req.params;
    if (!id || typeof id !== "string") {
      throw new Error("Geçerli bir 'id' parametresi gereklidir.");
    }

    const userId = req.user!.userId.toString();
    const companyId = req.user!.companyId;

    await deleteCompanyFinanceTransactionById(
      id,
      { userId, companyId },
      qr.manager
    );

    await qr.commitTransaction();     // ✅ kalıcılaştır
    res.status(204).send();           // ✅ DELETE için ideal yanıt
  } catch (error: any) {
    await qr.rollbackTransaction();   // 🔙 geri al
    console.error("❌ DELETE finance transaction error:", error);
    res.status(400).json({
      errorMessage: error.message || "Finansal işlem silinemedi.",
    });
  } finally {
    await qr.release();               // 🧹 bağlantıyı bırak
  }
};
