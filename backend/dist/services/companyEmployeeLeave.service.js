"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateLeaveDayCount = exports.deleteCompanyEmployeeLeave = exports.getCompanyEmployeeLeaveById = exports.getCompanyEmployeeLeavesByEmployeeId = exports.getCompanyEmployeeLeaves = exports.updateCompanyEmployeeLeave = exports.postCompanyEmployeeLeave = void 0;
const data_source_1 = require("../config/data-source");
const CompanyEmployee_1 = require("../entities/CompanyEmployee");
const CompanyEmployeeLeave_1 = require("../entities/CompanyEmployeeLeave");
const companyEmployee_service_1 = require("./companyEmployee.service");
const persist_1 = require("../utils/persist");
const sanitizeRules_1 = require("../utils/sanitizeRules");
const sanitize_1 = require("../utils/sanitize");
const postCompanyEmployeeLeave = async (employeeId, data, currentUser, manager = data_source_1.AppDataSource.manager) => {
    const employeeRepo = manager.getRepository(CompanyEmployee_1.CompanyEmployee);
    const leaveRepo = manager.getRepository(CompanyEmployeeLeave_1.CompanyEmployeeLeave);
    const employee = await employeeRepo.findOneOrFail({
        where: { id: employeeId, company: { id: currentUser.companyId } },
    });
    const calculatedLeaveDayCount = (0, exports.calculateLeaveDayCount)(data.startDate, data.endDate);
    // 🔄 Leave hakkını azalt
    await (0, companyEmployee_service_1.updateCompanyEmployeeLeaveChange)(employee.id, calculatedLeaveDayCount, data.type, currentUser.userId, manager, false // izin veriliyor → azalt
    );
    const leave = leaveRepo.create({
        employee,
        company: { id: currentUser.companyId },
        startDate: data.startDate,
        endDate: data.endDate,
        leaveDayCount: calculatedLeaveDayCount,
        type: data.type,
        description: data.description,
        createdBy: { id: currentUser.userId },
        updatedBy: { id: currentUser.userId },
    });
    return await (0, persist_1.saveRefetchSanitize)({
        entityName: "CompanyEmployeeLeave",
        save: () => leaveRepo.save(leave),
        refetch: () => leaveRepo.findOneOrFail({
            where: { id: leave.id, company: { id: currentUser.companyId } },
            relations: [
                "company",
                "employee",
                "createdBy",
                "updatedBy",
            ],
        }),
        rules: sanitizeRules_1.sanitizeRules,
        defaultError: "İzin kaydı oluşturulamadı.",
    });
};
exports.postCompanyEmployeeLeave = postCompanyEmployeeLeave;
const updateCompanyEmployeeLeave = async (id, data, currentUser, manager = data_source_1.AppDataSource.manager) => {
    const leaveRepo = manager.getRepository(CompanyEmployeeLeave_1.CompanyEmployeeLeave);
    const employeeRepo = manager.getRepository(CompanyEmployee_1.CompanyEmployee);
    const leave = await leaveRepo.findOneOrFail({
        where: { id, company: { id: currentUser.companyId } },
        relations: ["employee"],
    });
    if (!leave) {
        throw new Error("İzin kaydı bulunamadı.");
    }
    const originalDayCount = leave.leaveDayCount;
    const newStartDate = data.startDate ?? leave.startDate;
    const newEndDate = data.endDate ?? leave.endDate;
    const newType = data.type ?? leave.type;
    const newDayCount = (0, exports.calculateLeaveDayCount)(newStartDate, newEndDate);
    // 🔁 Eski hakkı geri ekle
    await (0, companyEmployee_service_1.updateCompanyEmployeeLeaveChange)(leave.employee.id, originalDayCount, leave.type, currentUser.userId, manager, true // reverse
    );
    // 🔻 Yeni hakkı düş
    await (0, companyEmployee_service_1.updateCompanyEmployeeLeaveChange)(leave.employee.id, newDayCount, newType, currentUser.userId, manager, false);
    leave.startDate = newStartDate;
    leave.endDate = newEndDate;
    leave.type = newType;
    leave.description = data.description ?? leave.description;
    leave.leaveDayCount = newDayCount;
    leave.updatedBy = { id: currentUser.userId };
    return await (0, persist_1.saveRefetchSanitize)({
        entityName: "CompanyEmployeeLeave",
        save: () => leaveRepo.save(leave),
        refetch: () => leaveRepo.findOneOrFail({
            where: { id: leave.id, company: { id: currentUser.companyId } },
            relations: [
                "company",
                "employee",
                "createdBy",
                "updatedBy",
            ],
        }),
        rules: sanitizeRules_1.sanitizeRules,
        defaultError: "İzin kaydı oluşturulamadı.",
    });
};
exports.updateCompanyEmployeeLeave = updateCompanyEmployeeLeave;
const getCompanyEmployeeLeaves = async (currentUser, manager = data_source_1.AppDataSource.manager) => {
    const leaveRepo = manager.getRepository(CompanyEmployeeLeave_1.CompanyEmployeeLeave);
    const leaves = await leaveRepo.find({
        where: {
            company: { id: currentUser.companyId },
        },
        order: { createdatetime: "DESC" },
        relations: [
            "company",
            "employee",
            "createdBy",
            "updatedBy",
        ],
    });
    return (0, sanitize_1.sanitizeEntity)(leaves, "CompanyEmployeeLeave", sanitizeRules_1.sanitizeRules);
};
exports.getCompanyEmployeeLeaves = getCompanyEmployeeLeaves;
const getCompanyEmployeeLeavesByEmployeeId = async (employeeId, currentUser, manager = data_source_1.AppDataSource.manager) => {
    const leaveRepo = manager.getRepository(CompanyEmployeeLeave_1.CompanyEmployeeLeave);
    const leaves = await leaveRepo.find({
        where: {
            employee: { id: employeeId },
            company: { id: currentUser.companyId }, // ✅ Doğrudan leave.company üzerinden filtre
        },
        order: { createdatetime: "DESC" },
        relations: [
            "company",
            "employee",
            "createdBy",
            "updatedBy",
        ],
    });
    return (0, sanitize_1.sanitizeEntity)(leaves, "CompanyEmployeeLeave", sanitizeRules_1.sanitizeRules);
};
exports.getCompanyEmployeeLeavesByEmployeeId = getCompanyEmployeeLeavesByEmployeeId;
const getCompanyEmployeeLeaveById = async (employeeId, leaveId, currentUser, manager = data_source_1.AppDataSource.manager) => {
    const leaveRepo = manager.getRepository(CompanyEmployeeLeave_1.CompanyEmployeeLeave);
    const leave = await leaveRepo.findOne({
        where: {
            id: leaveId,
            employee: { id: employeeId },
            company: { id: currentUser.companyId }, // ✅ doğrudan companyId kontrolü
        },
        relations: [
            "company",
            "employee",
            "createdBy",
            "updatedBy",
        ],
    });
    if (!leave) {
        throw new Error("İzin kaydı bulunamadı.");
    }
    return (0, sanitize_1.sanitizeEntity)(leave, "CompanyEmployeeLeave", sanitizeRules_1.sanitizeRules);
};
exports.getCompanyEmployeeLeaveById = getCompanyEmployeeLeaveById;
const deleteCompanyEmployeeLeave = async (
//employeeId: string,
leaveId, currentUser, manager = data_source_1.AppDataSource.manager) => {
    const leaveRepo = manager.getRepository(CompanyEmployeeLeave_1.CompanyEmployeeLeave);
    const leave = await leaveRepo.findOne({
        where: {
            id: leaveId,
            //employee: { id: employeeId },
            company: { id: currentUser.companyId }, // ✅ Daha güvenli ve performanslı kontrol
        },
        relations: ["employee"], // ❌ Sadece UI’da employee bilgisi gerekiyorsa eklenmeli
    });
    if (!leave)
        throw new Error("İzin kaydı bulunamadı.");
    // 🔁 İzin hakkını geri ekle
    await (0, companyEmployee_service_1.updateCompanyEmployeeLeaveChange)(leave.employee.id, leave.leaveDayCount, leave.type, currentUser.userId, manager, true // reverse mode
    );
    await leaveRepo.delete({ id: leaveId });
    return { message: "İzin kaydı başarıyla silindi." };
};
exports.deleteCompanyEmployeeLeave = deleteCompanyEmployeeLeave;
const calculateLeaveDayCount = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffInMs = end.getTime() - start.getTime();
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    if (diffInDays < 0) {
        throw new Error("End date must be after start date");
    }
    return parseFloat(diffInDays.toFixed(2));
};
exports.calculateLeaveDayCount = calculateLeaveDayCount;
