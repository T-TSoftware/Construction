import { AppDataSource } from "../config/data-source";
import { QuantityItem } from "../entities/QuantityItem";

const quantityRepo = AppDataSource.getRepository(QuantityItem);

export const createQuantityItem = async (
  data: {
    code: string;
    name: string;
    description?: string;
  },
  currentUser: {
    userId: string;
  }
): Promise<QuantityItem> => {
  const existing = await quantityRepo.findOneBy({ code: data.code });
  if (existing) {
    throw new Error(`'${data.code}' koduna sahip bir metraj kalemi zaten var.`);
  }

  const newItem = quantityRepo.create({
    code: data.code.trim().toUpperCase(),
    name: data.name.trim(),
    description: data.description?.trim(),
  });

  return await quantityRepo.save(newItem);
};

export const getQuantityItems = async () => {
  const items = await quantityRepo.find({
    order: { createdatetime: "ASC" },
  });

  return items.map((item) => ({
    code: item.code,
    name: item.name,
    description: item.description,
    createdatetime: item.createdatetime,
    updatedatetime: item.updatedatetime,
  }));
};
