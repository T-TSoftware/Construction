"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCompanyEmployeeLeaveHandler = exports.getCompanyEmployeeLeaveByIdHandler = exports.getCompanyEmployeeLeavesByEmployeeIdHandler = exports.getCompanyEmployeeLeavesHandler = exports.patchCompanyEmployeeLeaveHandler = exports.postCompanyEmployeeLeaveHandler = void 0;
const data_source_1 = require("../config/data-source");
const companyEmployeeLeave_service_1 = require("../services/companyEmployeeLeave.service");
const postCompanyEmployeeLeaveHandler = async (req, res) => {
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
        const { employeeId } = req.params;
        const { startDate, endDate, leaveDayCount, type, description } = req.body;
        if (!startDate || !endDate || !type) {
            throw new Error("Zorunlu alanlar eksik: startDate, endDate, type");
        }
        const newLeave = await (0, companyEmployeeLeave_service_1.postCompanyEmployeeLeave)(employeeId, {
            startDate,
            endDate,
            leaveDayCount, // leaveDayCount hesaplanıyor zaten
            type,
            description,
        }, { userId, companyId }, queryRunner.manager);
        await queryRunner.commitTransaction();
        res.status(201).json(newLeave);
        return;
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        console.error("❌ POST employee leave error:", error);
        res.status(400).json({
            errorMessage: error.message || "İzin kaydı oluşturulamadı.",
        });
        return;
    }
    finally {
        await queryRunner.release();
    }
};
exports.postCompanyEmployeeLeaveHandler = postCompanyEmployeeLeaveHandler;
const patchCompanyEmployeeLeaveHandler = async (req, res) => {
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
        const { leaveId } = req.params;
        const userId = req.user.userId.toString();
        const companyId = req.user.companyId;
        if (!leaveId) {
            throw new Error("Geçerli bir çalışan veya izin ID'si belirtilmelidir.");
        }
        const updatedLeave = await (0, companyEmployeeLeave_service_1.updateCompanyEmployeeLeave)(leaveId, req.body, { userId, companyId }, queryRunner.manager);
        await queryRunner.commitTransaction();
        res.status(200).json(updatedLeave);
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        console.error("❌ PATCH employee leave error:", error);
        res.status(400).json({
            errorMessage: error.message || "İzin güncellenemedi.",
        });
    }
    finally {
        await queryRunner.release();
    }
};
exports.patchCompanyEmployeeLeaveHandler = patchCompanyEmployeeLeaveHandler;
const getCompanyEmployeeLeavesHandler = async (req, res) => {
    /*if (req.user?.role !== "superadmin") {
      res
        .status(403)
        .json({ errorMessage: "Yalnızca superadmin işlem yapabilir." });
      return;
    }*/
    try {
        const userId = req.user.userId.toString();
        const companyId = req.user.companyId;
        const employeeLeaves = await (0, companyEmployeeLeave_service_1.getCompanyEmployeeLeaves)({ userId, companyId }, data_source_1.AppDataSource.manager);
        res.status(200).json({ employeeLeaves });
    }
    catch (error) {
        console.error("❌ GET Employees error:", error);
        res.status(500).json({
            errorMessage: error.message || "Çalışanlar getirilemedi.",
        });
    }
};
exports.getCompanyEmployeeLeavesHandler = getCompanyEmployeeLeavesHandler;
const getCompanyEmployeeLeavesByEmployeeIdHandler = async (req, res) => {
    if (req.user?.role !== "superadmin") {
        res.status(403).json({ error: "Yalnızca superadmin işlem yapabilir." });
        return;
    }
    try {
        const { employeeId } = req.params;
        if (!employeeId) {
            res.status(400).json({ error: "Çalışan ID zorunludur." });
            return;
        }
        const userId = req.user.userId.toString();
        const companyId = req.user.companyId;
        const employeeLeaves = await (0, companyEmployeeLeave_service_1.getCompanyEmployeeLeavesByEmployeeId)(employeeId, {
            userId,
            companyId,
        });
        res.status(200).json(employeeLeaves);
    }
    catch (error) {
        console.error("❌ GET employee by ID error:", error);
        res
            .status(500)
            .json({ error: error.message || "Çalışan bilgisi alınamadı." });
    }
};
exports.getCompanyEmployeeLeavesByEmployeeIdHandler = getCompanyEmployeeLeavesByEmployeeIdHandler;
const getCompanyEmployeeLeaveByIdHandler = async (req, res) => {
    if (req.user?.role !== "superadmin") {
        res
            .status(403)
            .json({ errorMessage: "Yalnızca superadmin işlem yapabilir." });
        return;
    }
    try {
        const { employeeId, leaveId } = req.params;
        const userId = req.user.userId.toString();
        const companyId = req.user.companyId;
        /*if (!employeeId || !leaveId) {
          throw new Error("Geçerli bir çalışan veya izin ID'si belirtilmelidir.");
        }*/
        const getEmployeeLeave = await (0, companyEmployeeLeave_service_1.getCompanyEmployeeLeaveById)(employeeId, leaveId, { userId, companyId }, data_source_1.AppDataSource.manager);
        res.status(200).json(getEmployeeLeave);
    }
    catch (error) {
        console.error("❌ PATCH employee leave error:", error);
        res.status(400).json({
            errorMessage: error.message || "İzin güncellenemedi.",
        });
    }
};
exports.getCompanyEmployeeLeaveByIdHandler = getCompanyEmployeeLeaveByIdHandler;
const deleteCompanyEmployeeLeaveHandler = async (req, res) => {
    try {
        const { employeeId, leaveId } = req.params;
        const userId = req.user.userId.toString();
        const companyId = req.user.companyId;
        if (!leaveId) {
            throw new Error("Geçerli bir çalışan veya izin ID'si belirtilmelidir.");
        }
        const result = await (0, companyEmployeeLeave_service_1.deleteCompanyEmployeeLeave)(
        //employeeId,
        leaveId, { userId, companyId }, data_source_1.AppDataSource.manager);
        res.status(200).json(result);
    }
    catch (error) {
        console.error("❌ [deleteCompanyEmployeeLeaveHandler] error:", error);
        res.status(404).json({ error: error.message || "Silme işlemi başarısız." });
    }
};
exports.deleteCompanyEmployeeLeaveHandler = deleteCompanyEmployeeLeaveHandler;
