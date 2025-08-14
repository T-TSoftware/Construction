"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompanyOrdersByProjectIdHandler = exports.getCompanyOrderByIdHandler = exports.getCompanyOrdersHandler = exports.postCompanyOrderHandler = void 0;
const data_source_1 = require("../config/data-source");
const companyOrder_service_1 = require("../services/companyOrder.service");
const postCompanyOrderHandler = async (req, res) => {
    // 🔐 Yalnızca superadmin işlem yapabilir
    if (req.user?.role !== "superadmin") {
        res
            .status(403)
            .json({ errorMessage: "Yalnızca superadmin işlemi yapabilir." });
        return;
    }
    const queryRunner = data_source_1.AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const userId = req.user.userId.toString();
        const companyId = req.user.companyId;
        const { stockId, projectId, customerName, totalAmount, description, stockType, } = req.body;
        const newOrder = await (0, companyOrder_service_1.createCompanyOrder)({
            stockId,
            projectId,
            customerName,
            totalAmount,
            description,
            stockType,
        }, { userId, companyId }, queryRunner.manager);
        await queryRunner.commitTransaction();
        res.status(201).json(newOrder);
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        console.error("❌ POST company order error:", error);
        res.status(500).json({
            errorMessage: error.message || "Satış kaydı oluşturulamadı.",
        });
    }
    finally {
        await queryRunner.release();
    }
};
exports.postCompanyOrderHandler = postCompanyOrderHandler;
const getCompanyOrdersHandler = async (req, res) => {
    /*if (req.user?.role !== "superadmin") {
      res
        .status(403)
        .json({ errorMessage: "Yalnızca superadmin işlem yapabilir." });
      return;
    }*/
    try {
        const userId = req.user.userId.toString();
        const companyId = req.user.companyId;
        const orders = await (0, companyOrder_service_1.getCompanyOrders)({ userId, companyId }, data_source_1.AppDataSource.manager);
        res.status(200).json({ orders });
    }
    catch (error) {
        console.error("❌ GET orders transactions error:", error);
        res.status(500).json({
            errorMessage: error.message || "Satışlar getirilemedi.",
        });
    }
};
exports.getCompanyOrdersHandler = getCompanyOrdersHandler;
const getCompanyOrderByIdHandler = async (req, res) => {
    if (req.user?.role !== "superadmin") {
        res.status(403).json({ error: "Yalnızca superadmin işlem yapabilir." });
        return;
    }
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ error: "Check ID zorunludur." });
            return;
        }
        const userId = req.user.userId.toString();
        const companyId = req.user.companyId;
        const order = await (0, companyOrder_service_1.getCompanyOrderById)(id, { userId, companyId });
        res.status(200).json(order);
    }
    catch (error) {
        console.error("❌ GET order by ID error:", error);
        res.status(500).json({ error: error.message || "Satış bilgisi alınamadı." });
    }
};
exports.getCompanyOrderByIdHandler = getCompanyOrderByIdHandler;
const getCompanyOrdersByProjectIdHandler = async (req, res) => {
    try {
        const { projectId } = req.params;
        const userId = req.user.userId.toString();
        const companyId = req.user.companyId;
        const orders = await (0, companyOrder_service_1.getCompanyOrdersByProjectId)(projectId, {
            userId,
            companyId,
        });
        res.status(200).json(orders);
    }
    catch (error) {
        console.error("❌ GET project suppliers error:", error);
        res.status(500).json({ error: "Satışlar alınamadı." });
        return;
    }
};
exports.getCompanyOrdersByProjectIdHandler = getCompanyOrdersByProjectIdHandler;
