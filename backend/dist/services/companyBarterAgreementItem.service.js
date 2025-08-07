"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBarterItemPaymentStatusNew = exports.updateBarterItemPaymentStatus = exports.getCompanyBarterAgreementItemById = exports.getCompanyBarterAgreementItemsByAgreementId = exports.getAllCompanyBarterAgreementItems = exports.postCompanyBarterAgreementItem = void 0;
const data_source_1 = require("../config/data-source");
const CompanyBarterAgreement_1 = require("../entities/CompanyBarterAgreement");
const CompanyBarterAgreementItem_1 = require("../entities/CompanyBarterAgreementItem");
const CompanyStock_1 = require("../entities/CompanyStock");
const ProjectSubcontractor_1 = require("../entities/ProjectSubcontractor");
const ProjectSupplier_1 = require("../entities/ProjectSupplier");
const generateCode_1 = require("../utils/generateCode");
const postCompanyBarterAgreementItem = async (agreementId, data, currentUser, manager = data_source_1.AppDataSource.manager) => {
    const agreementRepo = manager.getRepository(CompanyBarterAgreement_1.CompanyBarterAgreement);
    const itemRepo = manager.getRepository(CompanyBarterAgreementItem_1.CompanyBarterAgreementItem);
    const stockRepo = manager.getRepository(CompanyStock_1.CompanyStock);
    const subcontractorRepo = manager.getRepository(ProjectSubcontractor_1.ProjectSubcontractor);
    const supplierRepo = manager.getRepository(ProjectSupplier_1.ProjectSupplier);
    const agreement = await agreementRepo.findOneOrFail({
        where: {
            id: agreementId,
            company: { id: currentUser.companyId },
        },
    });
    const relatedStock = data.relatedStockCode
        ? await stockRepo.findOneBy({
            code: data.relatedStockCode,
            company: { id: currentUser.companyId },
        })
        : null;
    const relatedSubcontractor = data.relatedSubcontractorCode
        ? await subcontractorRepo.findOneBy({
            code: data.relatedSubcontractorCode,
            company: { id: currentUser.companyId },
        })
        : null;
    const relatedSupplier = data.relatedSupplierCode
        ? await supplierRepo.findOneBy({
            code: data.relatedSupplierCode,
            company: { id: currentUser.companyId },
        })
        : null;
    const code = await (0, generateCode_1.generateNextBarterAgreementItemCode)(manager, agreement.code, data.itemType);
    const item = itemRepo.create({
        code,
        barterAgreement: agreement,
        company: { id: currentUser.companyId },
        direction: data.direction,
        itemType: data.itemType,
        description: data.description,
        agreedValue: data.agreedValue,
        remainingAmount: data.itemType === "CASH" ? data.agreedValue : null,
        relatedStock: relatedStock ? { id: relatedStock.id } : null,
        relatedSubcontractor: relatedSubcontractor
            ? { id: relatedSubcontractor.id }
            : null,
        relatedSupplier: relatedSupplier ? { id: relatedSupplier.id } : null,
        assetDetails: data.assetDetails ?? undefined,
        createdBy: { id: currentUser.userId },
        updatedBy: { id: currentUser.userId },
    });
    return await itemRepo.save(item);
};
exports.postCompanyBarterAgreementItem = postCompanyBarterAgreementItem;
const getAllCompanyBarterAgreementItems = async (currentUser, manager = data_source_1.AppDataSource.manager) => {
    const itemRepo = manager.getRepository(CompanyBarterAgreementItem_1.CompanyBarterAgreementItem);
    return await itemRepo.find({
        where: {
            company: { id: currentUser.companyId },
        },
        order: { createdatetime: "DESC" },
        relations: {
            barterAgreement: true,
            relatedStock: true,
            relatedSubcontractor: true,
            relatedSupplier: true,
        },
    });
};
exports.getAllCompanyBarterAgreementItems = getAllCompanyBarterAgreementItems;
const getCompanyBarterAgreementItemsByAgreementId = async (barterId, currentUser, manager = data_source_1.AppDataSource.manager) => {
    const itemRepo = manager.getRepository(CompanyBarterAgreementItem_1.CompanyBarterAgreementItem);
    return await itemRepo.find({
        where: {
            barterAgreement: { id: barterId },
            company: { id: currentUser.companyId },
        },
        order: { createdatetime: "DESC" },
        relations: {
            relatedStock: true,
            relatedSubcontractor: true,
            relatedSupplier: true,
        },
    });
};
exports.getCompanyBarterAgreementItemsByAgreementId = getCompanyBarterAgreementItemsByAgreementId;
const getCompanyBarterAgreementItemById = async (itemId, currentUser, manager = data_source_1.AppDataSource.manager) => {
    const itemRepo = manager.getRepository(CompanyBarterAgreementItem_1.CompanyBarterAgreementItem);
    return await itemRepo.findOneOrFail({
        where: {
            id: itemId,
            company: { id: currentUser.companyId },
        },
        relations: {
            barterAgreement: true,
            relatedStock: true,
            relatedSubcontractor: true,
            relatedSupplier: true,
        },
    });
};
exports.getCompanyBarterAgreementItemById = getCompanyBarterAgreementItemById;
const updateBarterItemPaymentStatus = async (itemCode, processedAmount, currentUser, manager) => {
    const barterItemRepo = manager.getRepository(CompanyBarterAgreementItem_1.CompanyBarterAgreementItem);
    const barterItem = await barterItemRepo.findOneByOrFail({ code: itemCode });
    const totalProcessedAmount = Number(barterItem.processedAmount ?? 0) + processedAmount;
    const remainingAmount = Number(barterItem.remainingAmount) - Number(processedAmount);
    let status;
    if (remainingAmount <= 0) {
        status = barterItem.direction === "OUT" ? "PAID" : "COLLECTED";
    }
    else {
        status = "PARTIAL";
    }
    barterItem.processedAmount = totalProcessedAmount;
    barterItem.status = status;
    barterItem.remainingAmount = remainingAmount;
    barterItem.updatedBy = { id: currentUser.userId };
    return await barterItemRepo.save(barterItem);
};
exports.updateBarterItemPaymentStatus = updateBarterItemPaymentStatus;
const updateBarterItemPaymentStatusNew = async (itemCode, amount, currentUser, manager, isReverse = false) => {
    const barterItemRepo = manager.getRepository(CompanyBarterAgreementItem_1.CompanyBarterAgreementItem);
    const barterItem = await barterItemRepo.findOneByOrFail({ code: itemCode });
    const factor = isReverse ? -1 : 1;
    // ✅ processedAmount güncelle (increment/decrement)
    await barterItemRepo.increment({ id: barterItem.id }, "processedAmount", factor * amount);
    // Güncellenmiş veriyi tekrar al
    const updatedItem = await barterItemRepo.findOneOrFail({
        where: { id: barterItem.id },
    });
    // ✅ remainingAmount hesapla
    const remainingAmount = Number(updatedItem.agreedValue ?? 0) - Number(updatedItem.processedAmount);
    // ✅ status belirle
    let status;
    if (remainingAmount <= 0) {
        status = updatedItem.direction === "OUT" ? "PAID" : "COLLECTED";
    }
    else {
        status = "PARTIAL";
    }
    updatedItem.remainingAmount = remainingAmount;
    updatedItem.status = status;
    updatedItem.updatedBy = { id: currentUser.userId };
    updatedItem.updatedatetime = new Date();
    return await barterItemRepo.save(updatedItem);
};
exports.updateBarterItemPaymentStatusNew = updateBarterItemPaymentStatusNew;
