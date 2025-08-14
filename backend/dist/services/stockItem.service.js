"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStockItem = exports.getStockItems = exports.createStockItem = void 0;
const data_source_1 = require("../config/data-source");
const StockItem_1 = require("../entities/StockItem");
//import { generateStockCode } from "../utils/generateCode";
const stockItemRepo = data_source_1.AppDataSource.getRepository(StockItem_1.StockItem);
const createStockItem = async (data) => {
    const existing = await stockItemRepo.findOneBy({ category: data.category });
    if (existing) {
        throw new Error(`'${data.category}' stokta zaten mevcut.`);
    }
    //const code = await generateStockCode(data.category);
    const code = `STK-${(data.category, { lower: true })}-${(data.name, { lower: true })}`;
    const stockItem = stockItemRepo.create({
        code,
        name: data.name.trim(),
        description: data.description?.trim(),
        unit: data.unit.trim(),
        category: data.category.trim().toUpperCase(),
        stockableYN: data.stockableYN ?? "Y",
    });
    return await stockItemRepo.save(stockItem);
};
exports.createStockItem = createStockItem;
const getStockItems = async () => {
    const items = await stockItemRepo.find({
        order: { createdatetime: "ASC" },
    });
    return items.map((item) => ({
        code: item.code,
        name: item.name,
        description: item.description,
        unit: item.unit,
        category: item.category,
        createdatetime: item.createdatetime,
        updatedatetime: item.updatedatetime,
    }));
};
exports.getStockItems = getStockItems;
const updateStockItem = async (id, data) => {
    const item = await stockItemRepo.findOneByOrFail({ id });
    item.name = data.name?.trim() ?? item.name;
    item.description = data.description?.trim() ?? item.description;
    item.unit = data.unit?.trim() ?? item.unit;
    item.category = data.category?.trim().toUpperCase() ?? item.category;
    item.stockableYN = data.stockableYN ?? item.stockableYN;
    item.updatedatetime = new Date();
    return await stockItemRepo.save(item);
};
exports.updateStockItem = updateStockItem;
/*function slugify(category: string, arg1: { lower: boolean; }) {
  throw new Error("Function not implemented.");
}*/
