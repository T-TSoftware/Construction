import { AppDataSource } from "../config/data-source";
import { CompanyEmployee } from "../entities/CompanyEmployee";
import { EntityManager, In } from "typeorm";
import { CompanyProject } from "../entities/CompanyProject";
import { LeaveType } from "../entities/CompanyEmployeeLeave";
import { CompanyEmployeeProject } from "../entities/CompanyEmployeeProject";
import { Company } from "../entities/Company";
import { User } from "../entities/User";
import { normalize, saveRefetchSanitize } from "../utils/persist";
import { sanitizeRules } from "../utils/sanitizeRules";
import { sanitizeEntity } from "../utils/sanitize";
import { handleSaveWithUniqueConstraint } from "../utils/errorHandler";

interface CreateCompanyEmployeeInput {
  code: string;
  firstName?: string;
  lastName?: string;
  age?: number;
  startDate: Date;
  netSalary?: number;
  grossSalary?: number;
  position?: string;
  department?: string;
  projectCodes?: string[];
}

export const createCompanyEmployee = async (
  data: CreateCompanyEmployeeInput,
  currentUser: { userId: string; companyId: string },
  manager: EntityManager = AppDataSource.manager
) => {
  const employeeRepo = manager.getRepository(CompanyEmployee);
  const projectRepo = manager.getRepository(CompanyProject);
  const employeeProjectRepo = manager.getRepository(CompanyEmployeeProject);

  const employee = employeeRepo.create({
    code: `${data.position}-${data.firstName}${data.lastName}`.toUpperCase(),
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
        code: In(data.projectCodes),
        company: { id: currentUser.companyId }, // 🔒 sadece yetkili şirketin projeleri
      },
    });

    if (projects.length !== data.projectCodes.length) {
      throw new Error("Bazı projectCode'lar geçersiz.");
    }

    const projectAssignments = (data.projectCodes as string[]).map((code) => {
      const project = projects.find((p) => p.code === code);
      if (!project) throw new Error(`Project code bulunamadı: ${code}`);

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

  return await saveRefetchSanitize({
    entityName: "CompanyEmployee",
    save: () => employeeRepo.save(employee),
    refetch: () =>
      employeeRepo.findOneOrFail({
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
    rules: sanitizeRules,
    defaultError: "Çalışan kaydı oluşturulamadı.",
  });

};

export const getCompanyEmployees = async (
  currentUser: { userId: string; companyId: string },
  manager: EntityManager = AppDataSource.manager
) => {
  const repo = manager.getRepository(CompanyEmployee);

  const employees = await repo.find({
    where: {
      company: { id: currentUser.companyId },
    },
    relations: ["employeeProjects", "employeeProjects.project","createdBy","updatedBy","company"],
    order: { createdatetime: "DESC" },
  });

  //return employees;
  return sanitizeEntity(employees, "CompanyEmployee", sanitizeRules);
};

export const getCompanyEmployeeById = async (
  id: string,
  currentUser: { userId: string; companyId: string },
  manager: EntityManager = AppDataSource.manager
) => {
  const repo = manager.getRepository(CompanyEmployee);

  const employee = await repo.findOne({
    where: {
      id,
      company: { id: currentUser.companyId },
    },
    relations: ["employeeProjects", "employeeProjects.project","createdBy","updatedBy","company"],
  });

  if (!employee) {
    throw new Error("İlgili Çalışan bulunamadı.");
  }

  //return employee;
  return sanitizeEntity(employee, "CompanyEmployee", sanitizeRules);
};

export const updateCompanyEmployee = async (
  id: string,
  data: {
    firstName?: string;
    lastName?: string;
    age?: number;
    startDate?: Date;
    netSalary?: number;
    grossSalary?: number;
    position?: string;
    department?: string;
    paidLeaveAmount?: number;
    unpaidLeaveAmount?: number;
    sickLeaveAmount?: number;
    roadLeaveAmount?: number;
    excuseLeaveAmount?: number;
    projectCodes?: string[]; // ✅ yeni eklenen alan
  },
  currentUser: { userId: string; companyId: string },
  manager: EntityManager = AppDataSource.manager
) => {
  const employeeRepo = manager.getRepository(CompanyEmployee);
  const employeeProjectRepo = manager.getRepository(CompanyEmployeeProject);
  const projectRepo = manager.getRepository(CompanyProject);

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
  const code = `${normalize(data.position)}-${normalize(data.firstName)}${normalize(data.lastName)}`;
  employee.code = code;
  employee.updatedBy = { id: currentUser.userId } as User;
  employee.company = { id: currentUser.companyId } as Company;

  const saved = await handleSaveWithUniqueConstraint(
    () => employeeRepo.save(employee),
    "CompanyEmployee"
  );

  // 🔄 Proje atamalarını güncelle
  if (data.projectCodes) {
    // Mevcut eşleşmeleri sil
    await employeeProjectRepo.delete({ employee: { id } });

    // Yeni eşleşmeleri ekle
    const projectEntities = await projectRepo.findBy({
      code: In(data.projectCodes),
      company: { id: currentUser.companyId }, // ✅ Şirket doğrulaması
    });

    const projectAssignments = projectEntities.map((project) =>
      employeeProjectRepo.create({
        employee: { id: saved.id },
        project: { id: project.id },
        company: { id: currentUser.companyId },
        position: saved.position,
        createdBy: { id: currentUser.userId },
        updatedBy: { id: currentUser.userId },
      })
    );

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

  return sanitizeEntity(full, "CompanyEmployee", sanitizeRules);
};

export const updateCompanyEmployeeLeaveChange = async (
  employeeId: string,
  leaveDayCount: number,
  type: LeaveType,
  userId: string,
  manager: EntityManager,
  isReverse: boolean = false
) => {
  const repo = manager.getRepository(CompanyEmployee);
  const factor = isReverse ? 1 : -1;

  switch (type) {
    case "PAID":
      await repo.increment(
        { id: employeeId },
        "paidLeaveAmount",
        factor * leaveDayCount
      );
      break;
    case "UNPAID":
      await repo.increment(
        { id: employeeId },
        "unpaidLeaveAmount",
        factor * leaveDayCount
      );
      break;
    case "SICK":
      await repo.increment(
        { id: employeeId },
        "sickLeaveAmount",
        factor * leaveDayCount
      );
      break;
    case "ROAD":
      await repo.increment(
        { id: employeeId },
        "roadLeaveAmount",
        factor * leaveDayCount
      );
      break;
    case "EXCUSE":
      await repo.increment(
        { id: employeeId },
        "excuseLeaveAmount",
        factor * leaveDayCount
      );
      break;
  }

  await repo.update(
    { id: employeeId },
    {
      updatedBy: { id: userId },
      updatedatetime: new Date(),
    }
  );

  console.log(
    `${isReverse ? "REVERSE" : "APPLY"} ${type} leave: ${
      factor * leaveDayCount
    } gün → ${employeeId}`
  );
};

export const createCompanyEmployeeNew = async (
  data: CreateCompanyEmployeeInput,
  currentUser: { userId: string; companyId: string },
  manager: EntityManager = AppDataSource.manager
) => {
  const employeeRepo = manager.getRepository(CompanyEmployee);
  const projectRepo = manager.getRepository(CompanyProject);
  const employeeProjectRepo = manager.getRepository(CompanyEmployeeProject);

  // Güvenli CODE üretimi (trim + upper, null/undefined koruması)
  //const normalize = (s?: string) => (s ?? "").replace(/\s+/g, "").toUpperCase();

const code = `${normalize(data.position)}-${normalize(data.firstName)}${normalize(data.lastName)}`;

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
  const saved = await handleSaveWithUniqueConstraint(
    () => employeeRepo.save(employee),
    "CompanyEmployee"
  );

  // Proje atamaları
  if (data.projectCodes?.length) {
    const projects = await projectRepo.find({
      where: {
        code: In(data.projectCodes),
        company: { id: currentUser.companyId },
      },
    });

    if (projects.length !== data.projectCodes.length) {
      throw new Error("Bazı projectCode'lar geçersiz.");
    }

    const projectAssignments = data.projectCodes.map((pCode) => {
      const project = projects.find((p) => p.code === pCode);
      if (!project) throw new Error(`Project code bulunamadı: ${pCode}`);

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

  return sanitizeEntity(full, "CompanyEmployee", sanitizeRules);
};