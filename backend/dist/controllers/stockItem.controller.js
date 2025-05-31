"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patchStockItemHandler = exports.getStockItemsHandler = exports.postStockItemHandler = void 0;
const stockItem_service_1 = require("../services/stockItem.service");
const postStockItemHandler = async (req, res) => {
    if (req.user?.role !== "superadmin") {
        res.status(403).json({ error: "Yalnızca superadmin işlem yapabilir." });
        return;
    }
    try {
        const newItem = await (0, stockItem_service_1.createStockItem)(req.body);
        res.status(201).json(newItem);
    }
    catch (error) {
        console.error("❌ StockItem POST error:", error);
        res.status(500).json({ errorMessage: "Stok kalemi oluşturulamadı." });
    }
};
exports.postStockItemHandler = postStockItemHandler;
const getStockItemsHandler = async (req, res) => {
    try {
        const items = await (0, stockItem_service_1.getStockItems)();
        res.status(200).json(items);
        return;
    }
    catch (error) {
        console.error("❌ GET stock items error:", error);
        res.status(500).json({ error: "Stoklar kalemleri alınamadı." });
        return;
    }
};
exports.getStockItemsHandler = getStockItemsHandler;
const patchStockItemHandler = async (req, res) => {
    if (req.user?.role !== "superadmin") {
        res.status(403).json({ error: "Yalnızca superadmin işlem yapabilir." });
        return;
    }
    try {
        const { id } = req.params;
        const updatedStockItem = await (0, stockItem_service_1.updateStockItem)(id, req.body);
        res.status(200).json(updatedStockItem);
    }
    catch (error) {
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
exports.patchStockItemHandler = patchStockItemHandler;
