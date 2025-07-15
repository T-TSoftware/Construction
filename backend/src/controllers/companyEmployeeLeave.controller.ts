import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import {
  deleteCompanyEmployeeLeave,
  getCompanyEmployeeLeaveById,
  getCompanyEmployeeLeaves,
  getCompanyEmployeeLeavesByEmployeeId,
  postCompanyEmployeeLeave,
  updateCompanyEmployeeLeave,
} from "../services/companyEmployeeLeave.service";

export const postCompanyEmployeeLeaveHandler = async (
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

    const { employeeId } = req.params;
    const { startDate, endDate, leaveDayCount, type, description } = req.body;

    if (!startDate || !endDate || !type) {
      throw new Error("Zorunlu alanlar eksik: startDate, endDate, type");
    }

    const newLeave = await postCompanyEmployeeLeave(
      employeeId,
      {
        startDate,
        endDate,
        leaveDayCount, // leaveDayCount hesaplanıyor zaten
        type,
        description,
      },
      { userId, companyId },
      queryRunner.manager
    );

    await queryRunner.commitTransaction();
    res.status(201).json(newLeave);
    return;
  } catch (error: any) {
    await queryRunner.rollbackTransaction();
    console.error("❌ POST employee leave error:", error);
    res.status(400).json({
      errorMessage: error.message || "İzin kaydı oluşturulamadı.",
    });
    return;
  } finally {
    await queryRunner.release();
  }
};

export const patchCompanyEmployeeLeaveHandler = async (
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
    const { id: employeeId, leaveId } = req.params;
    const userId = req.user!.userId.toString();
    const companyId = req.user!.companyId;

    if (!leaveId) {
      throw new Error("Geçerli bir çalışan veya izin ID'si belirtilmelidir.");
    }

    const updatedLeave = await updateCompanyEmployeeLeave(
      leaveId,
      req.body,
      { userId, companyId },
      queryRunner.manager
    );

    await queryRunner.commitTransaction();
    res.status(200).json(updatedLeave);
  } catch (error: any) {
    await queryRunner.rollbackTransaction();
    console.error("❌ PATCH employee leave error:", error);
    res.status(400).json({
      errorMessage: error.message || "İzin güncellenemedi.",
    });
  } finally {
    await queryRunner.release();
  }
};

export const getCompanyEmployeeLeavesHandler = async (
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

    const employeeLeaves = await getCompanyEmployeeLeaves(
      { userId, companyId },
      AppDataSource.manager
    );

    res.status(200).json({ employeeLeaves });
  } catch (error: any) {
    console.error("❌ GET Employees error:", error);
    res.status(500).json({
      errorMessage: error.message || "Çalışanlar getirilemedi.",
    });
  }
};

export const getCompanyEmployeeLeavesByEmployeeIdHandler = async (
  req: Request,
  res: Response
) => {
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

    const userId = req.user!.userId.toString();
    const companyId = req.user!.companyId;

    const employeeLeaves = await getCompanyEmployeeLeavesByEmployeeId(
      employeeId,
      {
        userId,
        companyId,
      }
    );
    res.status(200).json(employeeLeaves);
  } catch (error: any) {
    console.error("❌ GET employee by ID error:", error);
    res
      .status(500)
      .json({ error: error.message || "Çalışan bilgisi alınamadı." });
  }
};

export const getCompanyEmployeeLeaveByIdHandler = async (
  req: Request,
  res: Response
) => {
  if (req.user?.role !== "superadmin") {
    res
      .status(403)
      .json({ errorMessage: "Yalnızca superadmin işlem yapabilir." });
    return;
  }

  try {
    const { employeeId, leaveId } = req.params;
    const userId = req.user!.userId.toString();
    const companyId = req.user!.companyId;

    if (!employeeId || !leaveId) {
      throw new Error("Geçerli bir çalışan veya izin ID'si belirtilmelidir.");
    }

    const getEmployeeLeave = await getCompanyEmployeeLeaveById(
      employeeId,
      leaveId,
      { userId, companyId },
      AppDataSource.manager
    );

    res.status(200).json(getEmployeeLeave);
  } catch (error: any) {
    console.error("❌ PATCH employee leave error:", error);
    res.status(400).json({
      errorMessage: error.message || "İzin güncellenemedi.",
    });
  }
};

export const deleteCompanyEmployeeLeaveHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { employeeId, leaveId } = req.params;
    const userId = req.user!.userId.toString();
    const companyId = req.user!.companyId;

    if (!employeeId || !leaveId) {
      throw new Error("Geçerli bir çalışan veya izin ID'si belirtilmelidir.");
    }

    const result = await deleteCompanyEmployeeLeave(
      employeeId,
      leaveId,
      { userId, companyId },
      AppDataSource.manager
    );

    res.status(200).json(result);
  } catch (error: any) {
    console.error("❌ [deleteCompanyEmployeeLeaveHandler] error:", error);
    res.status(404).json({ error: error.message || "Silme işlemi başarısız." });
  }
};
