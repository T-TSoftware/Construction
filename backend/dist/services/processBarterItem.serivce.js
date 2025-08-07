"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processBarterItem = void 0;
const CompanyStock_1 = require("../entities/CompanyStock");
const ProjectSubcontractor_1 = require("../entities/ProjectSubcontractor");
const ProjectSupplier_1 = require("../entities/ProjectSupplier");
const CompanyFinance_1 = require("../entities/CompanyFinance");
const processBarterItem = async ({ item, agreementCode, currentUser, manager, }) => {
    const stockRepo = manager.getRepository(CompanyStock_1.CompanyStock);
    const subcontractorRepo = manager.getRepository(ProjectSubcontractor_1.ProjectSubcontractor);
    const supplierRepo = manager.getRepository(ProjectSupplier_1.ProjectSupplier);
    const transactionRepo = manager.getRepository(CompanyFinance_1.CompanyFinanceTransaction);
    // Hizmet -> Ödeme
    if (item.itemType === "SERVICE" && item.direction === "IN") {
        if (item.relatedSubcontractor?.id) {
            await subcontractorRepo.increment({ id: item.relatedSubcontractor.id }, "paidAmount", item.agreedValue);
        }
        if (item.relatedSupplier?.id) {
            await supplierRepo.increment({ id: item.relatedSupplier.id }, "paidAmount", item.agreedValue);
        }
    }
    // Stok işlemleri
    if (item.itemType === "STOCK" && item.relatedStock?.id) {
        const quantityChange = 1;
        if (item.direction === "OUT") {
            console.log("Enter 1 ");
            await stockRepo.decrement({ id: item.relatedStock.id }, "quantity", quantityChange);
        }
        if (item.direction === "IN") {
            await stockRepo.increment({ id: item.relatedStock.id }, "quantity", quantityChange);
        }
    }
};
exports.processBarterItem = processBarterItem;
