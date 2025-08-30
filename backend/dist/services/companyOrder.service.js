"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderPaymentStatusNew = exports.getCompanyOrdersByProjectId = exports.getCompanyOrderById = exports.getCompanyOrders = exports.updateOrderPaymentStatus = exports.createCompanyOrder = void 0;
const data_source_1 = require("../config/data-source");
const CompanyOrder_1 = require("../entities/CompanyOrder");
const CompanyStock_1 = require("../entities/CompanyStock");
const CompanyProject_1 = require("../entities/CompanyProject");
const generateCode_1 = require("../utils/generateCode");
const companyStock_service_1 = require("./companyStock.service");
const persist_1 = require("../utils/persist");
const sanitizeRules_1 = require("../utils/sanitizeRules");
const sanitize_1 = require("../utils/sanitize");
const createCompanyOrder = async (data, currentUser, manager = data_source_1.AppDataSource.manager) => {
    const stockRepo = manager.getRepository(CompanyStock_1.CompanyStock);
    const projectRepo = manager.getRepository(CompanyProject_1.CompanyProject);
    const orderRepo = manager.getRepository(CompanyOrder_1.CompanyOrder);
    // 1. Stock'u bul
    const stock = await stockRepo.findOneOrFail({
        where: {
            id: data.stockId,
            company: { id: currentUser.companyId },
        },
    });
    // 2. Project opsiyonel
    let project = null;
    if (data.projectId) {
        project = await projectRepo.findOneOrFail({
            where: {
                id: data.projectId,
                company: { id: currentUser.companyId },
            },
        });
    }
    // 3. Kod üretimi
    /*const code = await generateNextOrderCode({
      companyId: currentUser.companyId,
      reference: project?.name ?? stock.category,
      manager,
    });*/
    const code = await (0, generateCode_1.generateEntityCode)(manager, currentUser.companyId, "CompanyOrder");
    // 4. Order oluştur
    const order = orderRepo.create({
        code,
        customerName: data.customerName,
        totalAmount: data.totalAmount,
        receivedAmount: 0,
        remainingAmount: data.totalAmount,
        status: "UNCOLLECTED",
        description: data.description,
        stockType: data.stockType,
        company: { id: currentUser.companyId },
        project: project ? { id: project.id } : null,
        stock: { id: stock.id },
        createdBy: { id: currentUser.userId },
        updatedBy: { id: currentUser.userId },
    });
    await (0, companyStock_service_1.decreaseStockQuantity)({
        stockId: stock.id,
        quantity: 1, // şu an için sabit 1 olarak kabul ettik
    }, manager);
    /*const savedOrder = await orderRepo.save(order);
    const fullOrder = await orderRepo.findOneOrFail({
      where: { id: savedOrder.id, company: { id: currentUser.companyId } },
      relations: ["project", "stock", "createdBy", "updatedBy"],
    });
  
    return fullOrder;*/
    return await (0, persist_1.saveRefetchSanitize)({
        entityName: "CompanyOrder",
        save: () => orderRepo.save(order),
        refetch: () => orderRepo.findOneOrFail({
            where: { id: order.id, company: { id: currentUser.companyId } },
            relations: ["project", "company", "stock", "createdBy", "updatedBy"],
        }),
        rules: sanitizeRules_1.sanitizeRules,
        defaultError: "Satıs kaydı oluşturulamadı.",
    });
};
exports.createCompanyOrder = createCompanyOrder;
const updateOrderPaymentStatus = async (orderCode, amountReceived, currentUser, manager) => {
    const orderRepo = manager.getRepository(CompanyOrder_1.CompanyOrder);
    const order = await orderRepo.findOneOrFail({
        where: {
            code: orderCode,
            company: { id: currentUser.companyId },
        },
    });
    order.receivedAmount = Number(order.receivedAmount) + amountReceived;
    order.remainingAmount = Number(order.totalAmount) - order.receivedAmount;
    order.status = order.remainingAmount <= 0 ? "COLLECTED" : "PARTIAL";
    //order.updatedatetime = new Date();
    order.updatedBy = { id: currentUser.userId };
    console.log("BEFORE", order.receivedAmount, "ADDING", amountReceived);
    return await orderRepo.save(order);
};
exports.updateOrderPaymentStatus = updateOrderPaymentStatus;
const getCompanyOrders = async (currentUser, manager = data_source_1.AppDataSource.manager) => {
    const repo = manager.getRepository(CompanyOrder_1.CompanyOrder);
    const orders = await repo.find({
        where: {
            company: { id: currentUser.companyId },
        },
        relations: ["stock", "project", "createdBy", "updatedBy", "company"],
        //order: { transactionDate: "DESC" },
    });
    return (0, sanitize_1.sanitizeEntity)(orders, "CompanyOrder", sanitizeRules_1.sanitizeRules);
};
exports.getCompanyOrders = getCompanyOrders;
const getCompanyOrderById = async (id, currentUser, manager = data_source_1.AppDataSource.manager) => {
    const repo = manager.getRepository(CompanyOrder_1.CompanyOrder);
    const order = await repo.findOne({
        where: {
            id,
            company: { id: currentUser.companyId },
        },
        relations: ["stock", "project", "createdBy", "updatedBy", "company"],
    });
    if (!order) {
        throw new Error("İlgili satış bulunamadı.");
    }
    return (0, sanitize_1.sanitizeEntity)(order, "CompanyOrder", sanitizeRules_1.sanitizeRules);
};
exports.getCompanyOrderById = getCompanyOrderById;
const getCompanyOrdersByProjectId = async (projectId, currentUser, manager = data_source_1.AppDataSource.manager) => {
    const repo = manager.getRepository(CompanyOrder_1.CompanyOrder);
    const order = await repo.find({
        where: {
            project: { id: projectId, company: { id: currentUser.companyId } },
            company: { id: currentUser.companyId },
        },
        relations: ["stock", "project", "createdBy", "updatedBy", "company"],
    });
    if (!order) {
        throw new Error("İlgili satış bulunamadı.");
    }
    return (0, sanitize_1.sanitizeEntity)(order, "CompanyOrder", sanitizeRules_1.sanitizeRules);
};
exports.getCompanyOrdersByProjectId = getCompanyOrdersByProjectId;
const updateOrderPaymentStatusNew = async (orderCode, amount, currentUser, manager, isReverse = false) => {
    const orderRepo = manager.getRepository(CompanyOrder_1.CompanyOrder);
    const order = await orderRepo.findOneOrFail({
        where: {
            code: orderCode,
            company: { id: currentUser.companyId },
        },
    });
    const factor = isReverse ? -1 : 1;
    // ✅ receivedAmount güncelle (increment/decrement)
    await orderRepo.increment({ id: order.id }, "receivedAmount", factor * amount);
    // Güncellenmiş order'ı tekrar çek
    const updatedOrder = await orderRepo.findOneOrFail({
        where: { id: order.id },
    });
    // ✅ remainingAmount ve status hesapla
    const remainingAmount = Number(updatedOrder.totalAmount) - Number(updatedOrder.receivedAmount);
    const status = remainingAmount <= 0 ? "COLLECTED" : "PARTIAL";
    updatedOrder.remainingAmount = remainingAmount;
    updatedOrder.status = status;
    updatedOrder.updatedBy = { id: currentUser.userId };
    updatedOrder.updatedatetime = new Date();
    // Kaydet
    return await orderRepo.save(updatedOrder);
};
exports.updateOrderPaymentStatusNew = updateOrderPaymentStatusNew;
