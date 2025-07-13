import { Request, Response } from "express";
import {
  createCompanyEmployee,
  getCompanyEmployeeById,
  getCompanyEmployees,
  updateCompanyEmployee,
} from "../services/companyEmployee.service";
import { AppDataSource } from "../config/data-source";

export const postCompanyEmployeeHandler = async (
  req: Request,
  res: Response
) => {
  if (req.user?.role !== "superadmin") {
    res
      .status(403)
      .json({ errorMessage: "Yalnızca superadmin işlemi yapabilir." });
    return;
  }
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    const userId = req.user!.userId.toString();
    const companyId = req.user!.companyId;

    const {
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
    } = req.body;

    const employee = await createCompanyEmployee(
      {
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
      },
      {
        userId,
        companyId,
      },
      queryRunner.manager
    );
    await queryRunner.commitTransaction();
    res.status(201).json(employee);
  } catch (error: any) {
    await queryRunner.rollbackTransaction();
    console.error("❌ POST Employee error:", error);
    res.status(500).json({
      errorMessage: error.message || "Çalışan kaydedilemedi.",
    });
  } finally {
    await queryRunner.release();
  }
};

export const getCompanyEmployeesHandler = async (
  req: Request,
  res: Response
) => {
  /*if (req.user?.role !== "superadmin") {
    res
      .status(403)
      .json({ errorMessage: "Yalnızca superadmin işlem yapabilir." });
    return;
  }*/

  try {
    const userId = req.user!.userId.toString();
    const companyId = req.user!.companyId;

    const employees = await getCompanyEmployees(
      { userId, companyId },
      AppDataSource.manager
    );

    res.status(200).json({ employees });
  } catch (error: any) {
    console.error("❌ GET Employees error:", error);
    res.status(500).json({
      errorMessage: error.message || "Çalışanlar getirilemedi.",
    });
  }
};

export const getCompanyEmployeeByIdHandler = async (
  req: Request,
  res: Response
) => {
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

    const userId = req.user!.userId.toString();
    const companyId = req.user!.companyId;

    const order = await getCompanyEmployeeById(id, { userId, companyId });
    res.status(200).json(order);
  } catch (error: any) {
    console.error("❌ GET employee by ID error:", error);
    res
      .status(500)
      .json({ error: error.message || "Çalışan bilgisi alınamadı." });
  }
};

export const updateCompanyEmployeeUpdateHandler = async (
  req: Request,
  res: Response
) => {
  if (req.user?.role !== "superadmin") {
    res
      .status(403)
      .json({ errorMessage: "Yalnızca superadmin işlem yapabilir." });
    return;
  }

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const userId = req.user!.userId.toString();
    const companyId = req.user!.companyId;
    const id = req.params.id;
    const body = req.body;

    if (!id || typeof id !== "string") {
      throw new Error("Geçerli bir 'id' parametresi gereklidir.");
    }

    const updatedEmployee = await updateCompanyEmployee(
      id,
      body,
      { userId, companyId },
      queryRunner.manager
    );

    await queryRunner.commitTransaction();
    res.status(200).json(updatedEmployee);
    return;
  } catch (error: any) {
    await queryRunner.rollbackTransaction();
    console.error("❌ PATCH employee error:", error);
    res.status(400).json({
      errorMessage: error.message || "Çalışan güncellenemedi.",
    });
    return;
  } finally {
    await queryRunner.release();
  }
};