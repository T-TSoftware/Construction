"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCompanyEmployeeUpdateHandler = exports.getCompanyEmployeeByIdHandler = exports.getCompanyEmployeesHandler = exports.postCompanyEmployeeHandler = void 0;
const companyEmployee_service_1 = require("../services/companyEmployee.service");
const data_source_1 = require("../config/data-source");
const postCompanyEmployeeHandler = async (req, res) => {
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
        const { code, firstName, lastName, age, startDate, netSalary, grossSalary, position, department, projectCodes, } = req.body;
        const employee = await (0, companyEmployee_service_1.createCompanyEmployee)({
            code,
            firstName,
            lastName,
            age,
            startDate,
            netSalary,
            grossSalary,
            position,
            department,
            projectCodes,
        }, {
            userId,
            companyId,
        }, queryRunner.manager);
        await queryRunner.commitTransaction();
        res.status(201).json(employee);
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        console.error("❌ POST Employee error:", error);
        res.status(500).json({
            errorMessage: error.message || "Çalışan kaydedilemedi.",
        });
    }
    finally {
        await queryRunner.release();
    }
};
exports.postCompanyEmployeeHandler = postCompanyEmployeeHandler;
const getCompanyEmployeesHandler = async (req, res) => {
    /*if (req.user?.role !== "superadmin") {
      res
        .status(403)
        .json({ errorMessage: "Yalnızca superadmin işlem yapabilir." });
      return;
    }*/
    try {
        const userId = req.user.userId.toString();
        const companyId = req.user.companyId;
        const employees = await (0, companyEmployee_service_1.getCompanyEmployees)({ userId, companyId }, data_source_1.AppDataSource.manager);
        res.status(200).json({ employees });
    }
    catch (error) {
        console.error("❌ GET Employees error:", error);
        res.status(500).json({
            errorMessage: error.message || "Çalışanlar getirilemedi.",
        });
    }
};
exports.getCompanyEmployeesHandler = getCompanyEmployeesHandler;
const getCompanyEmployeeByIdHandler = async (req, res) => {
    if (req.user?.role !== "superadmin") {
        res.status(403).json({ error: "Yalnızca superadmin işlem yapabilir." });
        return;
    }
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ error: "Çalışan ID zorunludur." });
            return;
        }
        const userId = req.user.userId.toString();
        const companyId = req.user.companyId;
        const order = await (0, companyEmployee_service_1.getCompanyEmployeeById)(id, { userId, companyId });
        res.status(200).json(order);
    }
    catch (error) {
        console.error("❌ GET employee by ID error:", error);
        res
            .status(500)
            .json({ error: error.message || "Çalışan bilgisi alınamadı." });
    }
};
exports.getCompanyEmployeeByIdHandler = getCompanyEmployeeByIdHandler;
const updateCompanyEmployeeUpdateHandler = async (req, res) => {
    if (req.user?.role !== "superadmin") {
        res
            .status(403)
            .json({ errorMessage: "Yalnızca superadmin işlem yapabilir." });
        return;
    }
    const queryRunner = data_source_1.AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const userId = req.user.userId.toString();
        const companyId = req.user.companyId;
        const id = req.params.id;
        const body = req.body;
        if (!id || typeof id !== "string") {
            throw new Error("Geçerli bir 'id' parametresi gereklidir.");
        }
        const updatedEmployee = await (0, companyEmployee_service_1.updateCompanyEmployee)(id, body, { userId, companyId }, queryRunner.manager);
        await queryRunner.commitTransaction();
        res.status(200).json(updatedEmployee);
        return;
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        console.error("❌ PATCH employee error:", error);
        res.status(400).json({
            errorMessage: error.message || "Çalışan güncellenemedi.",
        });
        return;
    }
    finally {
        await queryRunner.release();
    }
};
exports.updateCompanyEmployeeUpdateHandler = updateCompanyEmployeeUpdateHandler;
