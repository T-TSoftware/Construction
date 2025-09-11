import { AppDataSource } from "../config/data-source";
import { CompanyEmployee } from "../entities/CompanyEmployee";
import {
  CompanyEmployeeLeave,
  LeaveType,
} from "../entities/CompanyEmployeeLeave";
import { User } from "../entities/User";
import { EntityManager } from "typeorm";
import { updateCompanyEmployeeLeaveChange } from "./companyEmployee.service";
import { saveRefetchSanitize } from "../utils/persist";
import { sanitizeRules } from "../utils/sanitizeRules";
import { sanitizeEntity } from "../utils/sanitize";

export const postCompanyEmployeeLeave = async (
  employeeId: string,
  data: {
    startDate: Date;
    endDate: Date;
    leaveDayCount: number;
    type: LeaveType;
    description?: string;
  },
  currentUser: { userId: string; companyId: string },
  manager: EntityManager = AppDataSource.manager
) => {
  const employeeRepo = manager.getRepository(CompanyEmployee);
  const leaveRepo = manager.getRepository(CompanyEmployeeLeave);

  const employee = await employeeRepo.findOneOrFail({
    where: { id: employeeId, company: { id: currentUser.companyId } },
  });
  const calculatedLeaveDayCount = calculateLeaveDayCount(
    data.startDate,
    data.endDate
  );

  // 🔄 Leave hakkını azalt
  await updateCompanyEmployeeLeaveChange(
    employee.id,
    calculatedLeaveDayCount,
    data.type,
    currentUser.userId,
    manager,
    false // izin veriliyor → azalt
  );

  const leave = leaveRepo.create({
    employee,
    company: { id: currentUser.companyId },
    startDate: data.startDate,
    endDate: data.endDate,
    leaveDayCount: calculatedLeaveDayCount,
    type: data.type,
    description: data.description,
    createdBy: { id: currentUser.userId } as User,
    updatedBy: { id: currentUser.userId } as User,
  });

  return await saveRefetchSanitize({
      entityName: "CompanyEmployeeLeave",
      save: () => leaveRepo.save(leave),
      refetch: () =>
        leaveRepo.findOneOrFail({
          where: { id: leave.id, company: { id: currentUser.companyId } },
          relations: [
            "company",
            "employee",
            "createdBy",
            "updatedBy",
          ],
        }),
      rules: sanitizeRules,
      defaultError: "İzin kaydı oluşturulamadı.",
    });
};

export const postCompanyEmployeeLeaveWEmployeeId = async (
  data: {
    employeeId: string,
    startDate: Date;
    endDate: Date;
    leaveDayCount: number;
    type: LeaveType;
    description?: string;
  },
  currentUser: { userId: string; companyId: string },
  manager: EntityManager = AppDataSource.manager
) => {
  const employeeRepo = manager.getRepository(CompanyEmployee);
  const leaveRepo = manager.getRepository(CompanyEmployeeLeave);

  const employee = await employeeRepo.findOneOrFail({
    where: { id: data.employeeId, company: { id: currentUser.companyId } },
  });
  const calculatedLeaveDayCount = calculateLeaveDayCount(
    data.startDate,
    data.endDate
  );

  // 🔄 Leave hakkını azalt
  await updateCompanyEmployeeLeaveChange(
    employee.id,
    calculatedLeaveDayCount,
    data.type,
    currentUser.userId,
    manager,
    false // izin veriliyor → azalt
  );

  const leave = leaveRepo.create({
    employee,
    company: { id: currentUser.companyId },
    startDate: data.startDate,
    endDate: data.endDate,
    leaveDayCount: calculatedLeaveDayCount,
    type: data.type,
    description: data.description,
    createdBy: { id: currentUser.userId } as User,
    updatedBy: { id: currentUser.userId } as User,
  });

  return await saveRefetchSanitize({
      entityName: "CompanyEmployeeLeave",
      save: () => leaveRepo.save(leave),
      refetch: () =>
        leaveRepo.findOneOrFail({
          where: { id: leave.id, company: { id: currentUser.companyId } },
          relations: [
            "company",
            "employee",
            "createdBy",
            "updatedBy",
          ],
        }),
      rules: sanitizeRules,
      defaultError: "İzin kaydı oluşturulamadı.",
    });
};

export const updateCompanyEmployeeLeave = async (
  id: string,
  data: {
    startDate?: Date;
    endDate?: Date;
    type?: LeaveType;
    description?: string;
  },
  currentUser: { userId: string; companyId: string },
  manager: EntityManager = AppDataSource.manager
) => {
  const leaveRepo = manager.getRepository(CompanyEmployeeLeave);
  const employeeRepo = manager.getRepository(CompanyEmployee);

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

  const newDayCount = calculateLeaveDayCount(
    newStartDate as Date,
    newEndDate as Date
  );

  // 🔁 Eski hakkı geri ekle
  await updateCompanyEmployeeLeaveChange(
    leave.employee.id,
    originalDayCount,
    leave.type,
    currentUser.userId,
    manager,
    true // reverse
  );

  // 🔻 Yeni hakkı düş
  await updateCompanyEmployeeLeaveChange(
    leave.employee.id,
    newDayCount,
    newType,
    currentUser.userId,
    manager,
    false
  );

  leave.startDate = newStartDate;
  leave.endDate = newEndDate;
  leave.type = newType;
  leave.description = data.description ?? leave.description;
  leave.leaveDayCount = newDayCount;
  leave.updatedBy = { id: currentUser.userId } as any;

  return await saveRefetchSanitize({
      entityName: "CompanyEmployeeLeave",
      save: () => leaveRepo.save(leave),
      refetch: () =>
        leaveRepo.findOneOrFail({
          where: { id: leave.id, company: { id: currentUser.companyId } },
          relations: [
            "company",
            "employee",
            "createdBy",
            "updatedBy",
          ],
        }),
      rules: sanitizeRules,
      defaultError: "İzin kaydı oluşturulamadı.",
    });
};

export const getCompanyEmployeeLeaves = async (
  currentUser: { userId: string; companyId: string },
  manager: EntityManager = AppDataSource.manager
) => {
  const leaveRepo = manager.getRepository(CompanyEmployeeLeave);

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

  return sanitizeEntity(leaves, "CompanyEmployeeLeave", sanitizeRules);
};

export const getCompanyEmployeeLeavesByEmployeeId = async (
  employeeId: string,
  currentUser: { userId: string; companyId: string },
  manager: EntityManager = AppDataSource.manager
) => {
  const leaveRepo = manager.getRepository(CompanyEmployeeLeave);

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

  return sanitizeEntity(leaves, "CompanyEmployeeLeave", sanitizeRules);
};

export const getCompanyEmployeeLeaveById = async (
  employeeId: string,
  leaveId: string,
  currentUser: { userId: string; companyId: string },
  manager: EntityManager = AppDataSource.manager
) => {
  const leaveRepo = manager.getRepository(CompanyEmployeeLeave);

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

  return sanitizeEntity(leave, "CompanyEmployeeLeave", sanitizeRules);
};

export const deleteCompanyEmployeeLeave = async (
  //employeeId: string,
  leaveId: string,
  currentUser: { userId: string; companyId: string },
  manager: EntityManager = AppDataSource.manager
) => {
  const leaveRepo = manager.getRepository(CompanyEmployeeLeave);

  const leave = await leaveRepo.findOne({
    where: {
      id: leaveId,
      //employee: { id: employeeId },
      company: { id: currentUser.companyId }, // ✅ Daha güvenli ve performanslı kontrol
    },
     relations: ["employee"], // ❌ Sadece UI’da employee bilgisi gerekiyorsa eklenmeli
  });

  if (!leave) throw new Error("İzin kaydı bulunamadı.");

  // 🔁 İzin hakkını geri ekle
  await updateCompanyEmployeeLeaveChange(
    leave.employee.id,
    leave.leaveDayCount,
    leave.type,
    currentUser.userId,
    manager,
    true // reverse mode
  );

  await leaveRepo.delete({ id: leaveId });

  return { message: "İzin kaydı başarıyla silindi." };
};

export const calculateLeaveDayCount = (
  startDate: Date,
  endDate: Date
): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const diffInMs = end.getTime() - start.getTime();
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

  if (diffInDays < 0) {
    throw new Error("End date must be after start date");
  }

  return parseFloat(diffInDays.toFixed(2));
};
