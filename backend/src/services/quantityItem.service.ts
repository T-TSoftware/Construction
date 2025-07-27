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
    companyId: string; // ✅ companyId alındı
  }
): Promise<QuantityItem> => {
  const existing = await quantityRepo.findOne({
    where: {
      code: data.code.trim().toUpperCase(),
      company: { id: currentUser.companyId }, // ✅ şirket bazlı kontrol
    },
  });

  if (existing) {
    throw new Error(`'${data.code}' koduna sahip bir metraj kalemi zaten var.`);
  }

  const newItem = quantityRepo.create({
    code: data.code.trim().toUpperCase(),
    name: data.name.trim(),
    description: data.description?.trim(),
    company: { id: currentUser.companyId }, // ✅ company set edildi
    //createdBy: { id: currentUser.userId },
    //updatedBy: { id: currentUser.userId },
  });

  return await quantityRepo.save(newItem);
};

export const getQuantityItems = async (
  currentUser: { userId: string; companyId: string } // ✅ companyId alındı
) => {
  const items = await quantityRepo.find({
    where: { company: { id: currentUser.companyId } }, // ✅ sadece kendi şirketine aitler
    order: { createdatetime: "ASC" },
  });

  return items.map((item) => ({
    id: item.id,
    code: item.code,
    name: item.name,
    description: item.description,
    createdatetime: item.createdatetime,
    updatedatetime: item.updatedatetime,
  }));
};
