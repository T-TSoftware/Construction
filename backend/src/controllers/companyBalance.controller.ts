import { Request, Response } from "express";
import {
  getCompanyBalances,
  createBalance,
  updateBalance,
  deleteBalance,
} from "../services/companyBalance.service";
import { AppDataSource } from "../config/data-source";

// 📌 Listeleme – Her kullanıcı erişebilir
export const getCompanyBalancesHandler = async (req: Request, res: Response) => {
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
    const { name, currency, code } = req.query;

    // 🧠 View'den günlük nakit akışı verilerini al
    const result = await getCompanyBalances(
      { companyId },
      {
        name: name as string,
        currency: currency as string,
        code: code as string,
      }
    );

    // ✅ Yanıtla
    res.status(200).json(result);
  } catch (error: any) {
    console.error("❌ GET balances error:", error);
    res.status(500).json({
      errorMessage: "Bakiye verileri alınamadı.",
      detail: error.message,
    });
  }
};

// 📌 Oluşturma – Sadece superadmin
export const postCompanyBalanceHandler = async (
  req: Request,
  res: Response
) => {
  if (req.user?.role !== "superadmin") {
    res.status(403).json({ error: "Yalnızca superadmin işlemi yapabilir." });
    return;
  }

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const userId = req.user!.userId.toString();
    const companyId = req.user!.companyId;

    const results = [];

    for (const body of req.body) {
      const { name, amount, currency } = body;

      const newBalance = await createBalance(
        { name, amount, currency },
        { userId, companyId },
        queryRunner.manager
      );

      results.push(newBalance);
    }

    await queryRunner.commitTransaction();
    res.status(201).json(results);
  } catch (error: any) {
    await queryRunner.rollbackTransaction();
    console.error("❌ POST balance error:", error);
    res.status(500).json({
      errorMessage: error.message || "Bakiyeler oluşturulamadı.",
    });
  } finally {
    await queryRunner.release();
  }
};

// 📌 Güncelleme – Sadece superadmin
export const putCompanyBalanceHandler = async (req: Request, res: Response) => {
  if (req.user?.role !== "superadmin") {
    res.status(403).json({ error: "Yalnızca superadmin işlemi yapabilir." });
    return;
  }

  try {
    const updatedBy = req.user!.userId.toString();
    const balanceId = req.params.id;
    const fields = req.body;

    const updated = await updateBalance(balanceId, fields, updatedBy);
    if (!updated) {
      res.status(404).json({ error: "Bakiye bulunamadı." });
      return;
    }

    res.json(updated);
  } catch (error) {
    console.error("❌ PUT balance error:", error);
    res.status(500).json({ error: "Bakiye güncellenemedi." });
  }
};

// 📌 Silme – Sadece superadmin
export const deleteCompanyBalanceHandler = async (
  req: Request,
  res: Response
) => {
  if (req.user?.role !== "superadmin") {
    res.status(403).json({ error: "Yalnızca superadmin işlemi yapabilir." });
    return;
  }

  try {
    const id = Number(req.params.id);
    const deleted = await deleteBalance(id);

    if (!deleted) {
      res.status(404).json({ error: "Bakiye bulunamadı." });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error("❌ DELETE balance error:", error);
    res.status(500).json({ error: "Bakiye silinemedi." });
  }
};
