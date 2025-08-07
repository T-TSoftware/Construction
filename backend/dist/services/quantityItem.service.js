"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuantityItems = exports.createQuantityItem = void 0;
const data_source_1 = require("../config/data-source");
const QuantityItem_1 = require("../entities/QuantityItem");
const quantityRepo = data_source_1.AppDataSource.getRepository(QuantityItem_1.QuantityItem);
const createQuantityItem = async (data, currentUser) => {
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
exports.createQuantityItem = createQuantityItem;
const getQuantityItems = async (currentUser // ✅ companyId alındı
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
exports.getQuantityItems = getQuantityItems;
