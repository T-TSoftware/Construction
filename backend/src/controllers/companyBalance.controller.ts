import { Request, Response } from "express";
import {
  getCompanyBalances,
  createBalance,
  updateBalance,
  deleteBalance,
} from "../services/companyBalance.service";

// 📌 Listeleme – Her kullanıcı erişebilir
export const getCompanyBalancesHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const companyId = req.user!.companyId;
    const balances = await getCompanyBalances(companyId);
    res.json(balances);
  } catch (error) {
    console.error("❌ GET balances error:", error);
    res.status(500).json({ error: "Bakiye listesi alınamadı." });
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

  try {
    const { name, amount, currency } = req.body;
    const createdBy = req.user!.userId.toString();
    const companyId = req.user!.companyId;

    const newBalance = await createBalance(
      companyId,
      name,
      amount,
      currency,
      createdBy
    );
    res.status(201).json(newBalance);
  } catch (error) {
    console.error("❌ POST balance error:", error);
    res.status(500).json({ error: "Bakiye oluşturulamadı." });
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
