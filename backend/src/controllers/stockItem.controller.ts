import { Request, Response } from "express";
import {
  createStockItem,
  getStockItems,
  updateStockItem,
} from "../services/stockItem.service";

export const postStockItemHandler = async (req: Request, res: Response) => {
  if (req.user?.role !== "superadmin") {
    res.status(403).json({ error: "Yalnızca superadmin işlem yapabilir." });
    return;
  }
  try {
    const newItem = await createStockItem(req.body);
    res.status(201).json(newItem);
  } catch (error) {
    console.error("❌ StockItem POST error:", error);
    res.status(500).json({ errorMessage: "Stok kalemi oluşturulamadı." });
  }
};

export const getStockItemsHandler = async (req: Request, res: Response) => {
  try {
    const items = await getStockItems();
    res.status(200).json(items);
    return;
  } catch (error) {
    console.error("❌ GET stock items error:", error);
    res.status(500).json({ error: "Stoklar kalemleri alınamadı." });
    return;
  }
};

export const patchStockItemHandler = async (req: Request, res: Response) => {
  if (req.user?.role !== "superadmin") {
    res.status(403).json({ error: "Yalnızca superadmin işlem yapabilir." });
    return;
  }
  try {
    const { id } = req.params;
    const updatedStockItem = await updateStockItem(id, req.body);
    res.status(200).json(updatedStockItem);
  } catch (error: any) {
    console.error("❌ PATCH stock item error:", error);

    const isNotFound = error?.name === "EntityNotFoundError";
    res.status(isNotFound ? 404 : 500).json({
      errorMessage: isNotFound
        ? "Stok kalemi bulunamadı."
        : "Stok kalemi güncellenemedi.",
    });
    return;
  }
};
