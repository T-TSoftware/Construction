"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCompanyEmployeeNew = exports.updateCompanyEmployeeLeaveChange = exports.updateCompanyEmployee = exports.getCompanyEmployeeById = exports.getCompanyEmployees = exports.createCompanyEmployee = void 0;
const data_source_1 = require("../config/data-source");
const CompanyEmployee_1 = require("../entities/CompanyEmployee");
const typeorm_1 = require("typeorm");
const CompanyProject_1 = require("../entities/CompanyProject");
const CompanyEmployeeProject_1 = require("../entities/CompanyEmployeeProject");
const persist_1 = require("../utils/persist");
const sanitizeRules_1 = require("../utils/sanitizeRules");
const sanitize_1 = require("../utils/sanitize");
const errorHandler_1 = require("../utils/errorHandler");
const generateCode_1 = require("../utils/generateCode");
const createCompanyEmployee = async (data, currentUser, manager = data_source_1.AppDataSource.manager) => {
    const employeeRepo = manager.getRepository(CompanyEmployee_1.CompanyEmployee);
    const projectRepo = manager.getRepository(CompanyProject_1.CompanyProject);
    const employeeProjectRepo = manager.getRepository(CompanyEmployeeProject_1.CompanyEmployeeProject);
    const code = await (0, generateCode_1.generateEntityCode)(manager, currentUser.companyId, "CompanyEmployee");
    //const code = `${data.position}-${data.firstName}${data.lastName}`.toUpperCase(),
    const employee = employeeRepo.create({
        code,
        firstName: data.firstName,
        lastName: data.lastName,
        age: data.age,
        startDate: data.startDate,
        netSalary: data.netSalary,
        grossSalary: data.grossSalary,
        position: data.position,
        department: data.department,
        company: { id: currentUser.companyId },
        //project: project ? { id: project.id } : null,
        createdBy: { id: currentUser.userId },
        updatedBy: { id: currentUser.userId },
    });
    await employeeRepo.save(employee);
    // 🔗 Projeleri ilişkilendir
    if (data.projectCodes?.length) {
        const projects = await projectRepo.find({
            where: {
                code: (0, typeorm_1.In)(data.projectCodes),
                company: { id: currentUser.companyId }, // 🔒 sadece yetkili şirketin projeleri
            },
        });
        if (projects.length !== data.projectCodes.length) {
            throw new Error("Bazı projectCode'lar geçersiz.");
        }
        const projectAssignments = data.projectCodes.map((code) => {
            const project = projects.find((p) => p.code === code);
            if (!project)
                throw new Error(`Project code bulunamadı: ${code}`);
            return employeeProjectRepo.create({
                employee: { id: employee.id },
                project: { id: project.id },
                company: { id: currentUser.companyId },
                position: data.position,
                createdBy: { id: currentUser.userId },
                updatedBy: { id: currentUser.userId },
            });
        });
        await employeeProjectRepo.save(projectAssignments);
    }
    return await (0, persist_1.saveRefetchSanitize)({
        entityName: "CompanyEmployee",
        save: () => employeeRepo.save(employee),
        refetch: () => employeeRepo.findOneOrFail({
            where: { id: employee.id, company: { id: currentUser.companyId } },
            relations: [
                "project",
                "company",
                "employeeProjects",
                "employeeProjects.project",
                "createdBy",
                "updatedBy",
            ],
        }),
        rules: sanitizeRules_1.sanitizeRules,
        defaultError: "Çalışan kaydı oluşturulamadı.",
    });
};
exports.createCompanyEmployee = createCompanyEmployee;
const getCompanyEmployees = async (currentUser, manager = data_source_1.AppDataSource.manager) => {
    const repo = manager.getRepository(CompanyEmployee_1.CompanyEmployee);
    const employees = await repo.find({
        where: {
            company: { id: currentUser.companyId },
        },
        relations: ["employeeProjects", "employeeProjects.project", "createdBy", "updatedBy", "company"],
        order: { createdatetime: "DESC" },
    });
    //return employees;
    return (0, sanitize_1.sanitizeEntity)(employees, "CompanyEmployee", sanitizeRules_1.sanitizeRules);
};
exports.getCompanyEmployees = getCompanyEmployees;
const getCompanyEmployeeById = async (id, currentUser, manager = data_source_1.AppDataSource.manager) => {
    const repo = manager.getRepository(CompanyEmployee_1.CompanyEmployee);
    const employee = await repo.findOne({
        where: {
            id,
            company: { id: currentUser.companyId },
        },
        relations: ["employeeProjects", "employeeProjects.project", "createdBy", "updatedBy", "company"],
    });
    if (!employee) {
        throw new Error("İlgili Çalışan bulunamadı.");
    }
    //return employee;
    return (0, sanitize_1.sanitizeEntity)(employee, "CompanyEmployee", sanitizeRules_1.sanitizeRules);
};
exports.getCompanyEmployeeById = getCompanyEmployeeById;
const updateCompanyEmployee = async (id, data, currentUser, manager = data_source_1.AppDataSource.manager) => {
    const employeeRepo = manager.getRepository(CompanyEmployee_1.CompanyEmployee);
    const employeeProjectRepo = manager.getRepository(CompanyEmployeeProject_1.CompanyEmployeeProject);
    const projectRepo = manager.getRepository(CompanyProject_1.CompanyProject);
    const employee = await employeeRepo.findOneOrFail({
        where: { id, company: { id: currentUser.companyId } }, // ✅ güvenli filtreleme
    });
    // 📝 Alanları güncelle
    employee.firstName = data.firstName ?? employee.firstName;
    employee.lastName = data.lastName ?? employee.lastName;
    employee.age = data.age ?? employee.age;
    employee.startDate = data.startDate ?? employee.startDate;
    employee.netSalary = data.netSalary ?? employee.netSalary;
    employee.grossSalary = data.grossSalary ?? employee.grossSalary;
    employee.position = data.position ?? employee.position;
    employee.department = data.department ?? employee.department;
    employee.paidLeaveAmount = data.paidLeaveAmount ?? employee.paidLeaveAmount;
    employee.unpaidLeaveAmount =
        data.unpaidLeaveAmount ?? employee.unpaidLeaveAmount;
    employee.sickLeaveAmount = data.sickLeaveAmount ?? employee.sickLeaveAmount;
    employee.roadLeaveAmount = data.roadLeaveAmount ?? employee.roadLeaveAmount;
    employee.excuseLeaveAmount =
        data.excuseLeaveAmount ?? employee.excuseLeaveAmount;
    const code = `${(0, persist_1.normalize)(data.position)}-${(0, persist_1.normalize)(data.firstName)}${(0, persist_1.normalize)(data.lastName)}`;
    employee.code = code;
    employee.updatedBy = { id: currentUser.userId };
    employee.company = { id: currentUser.companyId };
    const saved = await (0, errorHandler_1.handleSaveWithUniqueConstraint)(() => employeeRepo.save(employee), "CompanyEmployee");
    // 🔄 Proje atamalarını güncelle
    if (data.projectCodes) {
        // Mevcut eşleşmeleri sil
        await employeeProjectRepo.delete({ employee: { id } });
        // Yeni eşleşmeleri ekle
        const projectEntities = await projectRepo.findBy({
            code: (0, typeorm_1.In)(data.projectCodes),
            company: { id: currentUser.companyId }, // ✅ Şirket doğrulaması
        });
        const projectAssignments = projectEntities.map((project) => employeeProjectRepo.create({
            employee: { id: saved.id },
            project: { id: project.id },
            company: { id: currentUser.companyId },
            position: saved.position,
            createdBy: { id: currentUser.userId },
            updatedBy: { id: currentUser.userId },
        }));
        await employeeProjectRepo.save(projectAssignments);
    }
    const full = await employeeRepo.findOneOrFail({
        where: { id: saved.id, company: { id: currentUser.companyId } },
        relations: [
            "company",
            "employeeProjects",
            "employeeProjects.project",
            "createdBy",
            "updatedBy",
        ],
    });
    return (0, sanitize_1.sanitizeEntity)(full, "CompanyEmployee", sanitizeRules_1.sanitizeRules);
};
exports.updateCompanyEmployee = updateCompanyEmployee;
const updateCompanyEmployeeLeaveChange = async (employeeId, leaveDayCount, type, userId, manager, isReverse = false) => {
    const repo = manager.getRepository(CompanyEmployee_1.CompanyEmployee);
    const factor = isReverse ? 1 : -1;
    switch (type) {
        case "PAID":
            await repo.increment({ id: employeeId }, "paidLeaveAmount", factor * leaveDayCount);
            break;
        case "UNPAID":
            await repo.increment({ id: employeeId }, "unpaidLeaveAmount", factor * leaveDayCount);
            break;
        case "SICK":
            await repo.increment({ id: employeeId }, "sickLeaveAmount", factor * leaveDayCount);
            break;
        case "ROAD":
            await repo.increment({ id: employeeId }, "roadLeaveAmount", factor * leaveDayCount);
            break;
        case "EXCUSE":
            await repo.increment({ id: employeeId }, "excuseLeaveAmount", factor * leaveDayCount);
            break;
    }
    await repo.update({ id: employeeId }, {
        updatedBy: { id: userId },
        updatedatetime: new Date(),
    });
    console.log(`${isReverse ? "REVERSE" : "APPLY"} ${type} leave: ${factor * leaveDayCount} gün → ${employeeId}`);
};
exports.updateCompanyEmployeeLeaveChange = updateCompanyEmployeeLeaveChange;
const createCompanyEmployeeNew = async (data, currentUser, manager = data_source_1.AppDataSource.manager) => {
    const employeeRepo = manager.getRepository(CompanyEmployee_1.CompanyEmployee);
    const projectRepo = manager.getRepository(CompanyProject_1.CompanyProject);
    const employeeProjectRepo = manager.getRepository(CompanyEmployeeProject_1.CompanyEmployeeProject);
    // Güvenli CODE üretimi (trim + upper, null/undefined koruması)
    //const normalize = (s?: string) => (s ?? "").replace(/\s+/g, "").toUpperCase();
    const code = `${(0, persist_1.normalize)(data.position)}-${(0, persist_1.normalize)(data.firstName)}${(0, persist_1.normalize)(data.lastName)}`;
    const employee = employeeRepo.create({
        code,
        firstName: data.firstName,
        lastName: data.lastName,
        age: data.age,
        startDate: data.startDate,
        netSalary: data.netSalary,
        grossSalary: data.grossSalary,
        position: data.position,
        department: data.department,
        company: { id: currentUser.companyId },
        createdBy: { id: currentUser.userId },
        updatedBy: { id: currentUser.userId },
    });
    // önce kaydet -> id lazım
    const saved = await (0, errorHandler_1.handleSaveWithUniqueConstraint)(() => employeeRepo.save(employee), "CompanyEmployee");
    // Proje atamaları
    if (data.projectCodes?.length) {
        const projects = await projectRepo.find({
            where: {
                code: (0, typeorm_1.In)(data.projectCodes),
                company: { id: currentUser.companyId },
            },
        });
        if (projects.length !== data.projectCodes.length) {
            throw new Error("Bazı projectCode'lar geçersiz.");
        }
        const projectAssignments = data.projectCodes.map((pCode) => {
            const project = projects.find((p) => p.code === pCode);
            if (!project)
                throw new Error(`Project code bulunamadı: ${pCode}`);
            return employeeProjectRepo.create({
                employee: { id: saved.id },
                project: { id: project.id },
                company: { id: currentUser.companyId },
                position: saved.position,
                createdBy: { id: currentUser.userId },
                updatedBy: { id: currentUser.userId },
            });
        });
        await employeeProjectRepo.save(projectAssignments);
    }
    // Refetch + sanitize (DOĞRU relations)
    const full = await employeeRepo.findOneOrFail({
        where: { id: saved.id, company: { id: currentUser.companyId } },
        relations: [
            "company",
            "employeeProjects",
            "employeeProjects.project",
            "createdBy",
            "updatedBy",
        ],
    });
    return (0, sanitize_1.sanitizeEntity)(full, "CompanyEmployee", sanitizeRules_1.sanitizeRules);
};
exports.createCompanyEmployeeNew = createCompanyEmployeeNew;
