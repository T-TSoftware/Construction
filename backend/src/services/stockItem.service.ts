import { AppDataSource } from "../config/data-source";
import { StockItem } from "../entities/StockItem";
import { generateStockCode } from "../utils/generateCode";

const stockItemRepo = AppDataSource.getRepository(StockItem);

export const createStockItem = async (data: {
  name: string;
  description?: string;
  unit: string;
  category: string;
  stockableYN?: "Y" | "N";
}) => {
  const existing = await stockItemRepo.findOneBy({ category: data.category });
  if (existing) {
    throw new Error(`'${data.category}' stokta zaten mevcut.`);
  }
  const code = await generateStockCode(data.category);

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

export const getStockItems = async () => {
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

export const updateStockItem = async (
  id: string,
  data: {
    name?: string;
    description?: string;
    unit?: string;
    category?: string;
    stockableYN?: "Y" | "N";
  }
) => {
  const item = await stockItemRepo.findOneByOrFail({ id });

  item.name = data.name?.trim() ?? item.name;
  item.description = data.description?.trim() ?? item.description;
  item.unit = data.unit?.trim() ?? item.unit;
  item.category = data.category?.trim().toUpperCase() ?? item.category;
  item.stockableYN = data.stockableYN ?? item.stockableYN;

  item.updatedatetime = new Date();

  return await stockItemRepo.save(item);
};
