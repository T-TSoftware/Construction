"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateNextBarterAgreementItemCode = exports.generateNextOrderCode = exports.generateFinanceTransactionCode = exports.generateNextEntityCode = exports.generateStockCode = void 0;
exports.generateNextCompanyCode = generateNextCompanyCode;
exports.generateNextBalanceCode = generateNextBalanceCode;
exports.generateUserCode = generateUserCode;
exports.generateNextEstimatedCostCode = generateNextEstimatedCostCode;
exports.generateNextProjectCode = generateNextProjectCode;
const data_source_1 = require("../config/data-source");
const CompanyStock_1 = require("../entities/CompanyStock");
const ProjectSupplier_1 = require("../entities/ProjectSupplier"); // ya da ProjectSubcontractor
const ProjectSubcontractor_1 = require("../entities/ProjectSubcontractor");
const CompanyBarterAgreement_1 = require("../entities/CompanyBarterAgreement");
const CompanyFinance_1 = require("../entities/CompanyFinance");
const CompanyOrder_1 = require("../entities/CompanyOrder");
const CompanyBarterAgreementItem_1 = require("../entities/CompanyBarterAgreementItem");
function generateNextCompanyCode(latestCode, name) {
    const prefix = name.slice(0, 3).toUpperCase();
    if (!latestCode || !latestCode.startsWith(prefix))
        return `${prefix}001`;
    const num = parseInt(latestCode.replace(prefix, ""));
    const nextNum = (num + 1).toString().padStart(3, "0");
    return `${prefix}${nextNum}`;
}
function generateNextBalanceCode(latestCode, name) {
    const prefix = name.slice(0, 3).toUpperCase();
    if (!latestCode || !latestCode.startsWith(prefix))
        return `${prefix}001`;
    const num = parseInt(latestCode.replace(prefix, ""));
    const nextNum = (num + 1).toString().padStart(3, "0");
    return `${prefix}${nextNum}`;
}
function generateUserCode(companyCode, userName) {
    const companyPart = companyCode.slice(0, 3).toUpperCase().padEnd(3, "_");
    const userPart = userName.slice(0, 3).toUpperCase().padEnd(3, "_");
    return `${companyPart}-${userPart}`;
}
function generateNextEstimatedCostCode(latestCode, projectCode, costName) {
    const giderPrefix = costName.slice(0, 3).toUpperCase();
    const prefix = `${projectCode}-${giderPrefix}`;
    if (!latestCode || !latestCode.startsWith(prefix)) {
        return `${prefix}001`;
    }
    const num = parseInt(latestCode.replace(prefix, ""));
    const nextNum = (num + 1).toString().padStart(3, "0");
    return `${prefix}${nextNum}`;
}
function generateNextProjectCode(latestCode, companyCode, projectSite) {
    const companyPrefix = companyCode.slice(0, 3).toUpperCase();
    const projectPrefix = projectSite
        .trim()
        .split(" ")[0]
        .slice(0, 3)
        .toUpperCase();
    const fullPrefix = `${companyPrefix}-${projectPrefix}`;
    if (!latestCode || !latestCode.startsWith(fullPrefix)) {
        return `${fullPrefix}001`;
    }
    const numPart = latestCode.replace(fullPrefix, "");
    const nextNum = (parseInt(numPart) + 1).toString().padStart(3, "0");
    return `${fullPrefix}${nextNum}`;
}
const generateStockCode = async (category, manager = data_source_1.AppDataSource.manager) => {
    //const compaynStockRepo = AppDataSource.getRepository(CompanyStock);
    const stockRepo = manager.getRepository(CompanyStock_1.CompanyStock);
    const prefix = `STK-${category.toUpperCase()}`;
    const latest = await stockRepo
        .createQueryBuilder("item")
        .where("item.code LIKE :prefix", { prefix: `${prefix}-%` })
        .orderBy("item.code", "DESC")
        .getOne();
    const lastNumber = latest ? parseInt(latest.code.split("-")[2]) : 0;
    const nextNumber = (lastNumber + 1).toString().padStart(3, "0");
    return `${prefix}-${nextNumber}`;
};
exports.generateStockCode = generateStockCode;
const generateNextEntityCode = async (manager, projectCode, category, typePrefix, // TED = Tedarikçi, TAS = Taşeron, BRT = Barter
entity) => {
    const repo = (() => {
        switch (entity) {
            case "ProjectSupplier":
                return manager.getRepository(ProjectSupplier_1.ProjectSupplier);
            case "ProjectSubcontractor":
                return manager.getRepository(ProjectSubcontractor_1.ProjectSubcontractor);
            case "CompanyBarterAgreement":
                return manager.getRepository(CompanyBarterAgreement_1.CompanyBarterAgreement);
            default:
                throw new Error("Unknown entity type.");
        }
    })();
    const projectSuffix = projectCode.split("-")[1].toUpperCase();
    const categoryPrefix = category.trim().slice(0, 3).toUpperCase();
    const fullPrefix = `${projectSuffix}-${typePrefix}-${categoryPrefix}`;
    const latest = await repo
        .createQueryBuilder("e")
        .where("e.code LIKE :prefix", { prefix: `${fullPrefix}%` })
        .orderBy("e.code", "DESC")
        .getOne();
    const nextNumber = latest
        ? (parseInt(latest.code.replace(fullPrefix, "")) + 1)
            .toString()
            .padStart(3, "0")
        : "001";
    return `${fullPrefix}${nextNumber}`;
};
exports.generateNextEntityCode = generateNextEntityCode;
/*export const generateFinanceTransactionCode = async (
  type: "PAYMENT" | "COLLECTION" | "TRANSFER",
  transactionDate: Date,
  manager: DataSource["manager"]
): Promise<string> => {
  const prefixMap = {
    PAYMENT: "PAY",
    COLLECTION: "COL",
    TRANSFER: "TRF",
  };

  const typeCode = prefixMap[type];
  const now = new Date();

  // MMDDYYYY formatı
  const datePart = `${(now.getMonth() + 1).toString().padStart(2, "0")}${now
    .getDate()
    .toString()
    .padStart(2, "0")}${now.getFullYear()}`;

  const prefix = `${typeCode}-${datePart}`;

  const repo = manager.getRepository(CompanyFinanceTransaction);

  const latest = await repo
    .createQueryBuilder("trx")
    .where("trx.code LIKE :prefix", { prefix: `${prefix}-%` })
    .orderBy("trx.code", "DESC")
    .getOne();

  const lastNumber = latest
    ? parseInt(latest.code.split("-")[2])
    : 0;

  const nextNumber = (lastNumber + 1).toString().padStart(4, "0");

  return `${prefix}-${nextNumber}`;
};*/
const generateFinanceTransactionCode = async (type, transactionDate, manager, direction // only for TRANSFER
) => {
    const date = new Date(transactionDate);
    const datePart = `${(date.getMonth() + 1).toString().padStart(2, "0")}${date
        .getDate()
        .toString()
        .padStart(2, "0")}${date.getFullYear()}`;
    let prefix = "";
    if (type === "TRANSFER") {
        if (!direction)
            throw new Error("TRANSFER type requires a direction (IN or OUT).");
        prefix = direction === "OUT" ? `TRFOUT-${datePart}` : `TRFIN-${datePart}`;
    }
    else {
        const prefixMap = {
            PAYMENT: "PAY",
            COLLECTION: "COL",
        };
        prefix = `${prefixMap[type]}-${datePart}`;
    }
    const repo = manager.getRepository(CompanyFinance_1.CompanyFinanceTransaction);
    const latest = await repo
        .createQueryBuilder("trx")
        .where("trx.code LIKE :prefix", { prefix: `${prefix}-%` })
        .orderBy("trx.code", "DESC")
        .getOne();
    const lastNumber = latest ? parseInt(latest.code.split("-")[2]) : 0;
    const nextNumber = (lastNumber + 1).toString().padStart(4, "0");
    return `${prefix}-${nextNumber}`;
};
exports.generateFinanceTransactionCode = generateFinanceTransactionCode;
const generateNextOrderCode = async ({ companyId, reference, // projectName ya da stockCategory
manager, }) => {
    const today = new Date();
    const datePart = `${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}${today.getFullYear()}`;
    const prefix = `SAT-${reference.toUpperCase()}-${datePart}`;
    const repo = manager.getRepository(CompanyOrder_1.CompanyOrder);
    const latest = await repo
        .createQueryBuilder("order")
        .where("order.companyid = :companyId AND order.code LIKE :prefix", {
        companyId,
        prefix: `${prefix}-%`,
    })
        .orderBy("order.code", "DESC")
        .getOne();
    const lastNumber = latest ? parseInt(latest.code.split("-").pop()) : 0;
    const nextNumber = (lastNumber + 1).toString().padStart(3, "0");
    return `${prefix}-${nextNumber}`;
};
exports.generateNextOrderCode = generateNextOrderCode;
const generateNextBarterAgreementItemCode = async (manager, barterAgreementCode, itemType) => {
    const repo = manager.getRepository(CompanyBarterAgreementItem_1.CompanyBarterAgreementItem);
    const itemTypePrefix = itemType.slice(0, 3).toUpperCase(); // e.g. "SER", "CAS"
    const prefix = `${barterAgreementCode}-${itemTypePrefix}`;
    const latest = await repo
        .createQueryBuilder("item")
        .where("item.code LIKE :prefix", { prefix: `${prefix}%` })
        .orderBy("item.code", "DESC")
        .getOne();
    const nextNumber = latest
        ? (parseInt(latest.code.replace(prefix, "")) + 1).toString().padStart(3, "0")
        : "001";
    return `${prefix}${nextNumber}`;
};
exports.generateNextBarterAgreementItemCode = generateNextBarterAgreementItemCode;
