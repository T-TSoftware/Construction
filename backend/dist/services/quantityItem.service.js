"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuantityItems = exports.createQuantityItem = void 0;
const data_source_1 = require("../config/data-source");
const QuantityItem_1 = require("../entities/QuantityItem");
const quantityRepo = data_source_1.AppDataSource.getRepository(QuantityItem_1.QuantityItem);
const createQuantityItem = async (data, currentUser) => {
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
exports.createQuantityItem = createQuantityItem;
const getQuantityItems = async () => {
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
exports.getQuantityItems = getQuantityItems;
