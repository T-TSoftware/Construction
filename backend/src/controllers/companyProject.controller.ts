import { Request, Response } from "express";
import {
  createProject,
  getCompanyProjects,
  getProjectById,
} from "../services/companyProject.service";

export const postCompanyProjectHandler = async (
  req: Request,
  res: Response
) => {
  if (req.user?.role !== "superadmin") {
    res.status(403).json({ error: "Yalnızca superadmin işlemi yapabilir." });
    return;
  }

  try {
    const {
      name,
      site,
      status,
      estimatedStartDate,
      actualStartDate,
      estimatedEndDate,
      actualEndDate,
    } = req.body;

    const userId = req.user!.userId.toString();
    const companyId = req.user!.companyId;

    const newProject = await createProject(
      {
        name,
        site,
        status,
        estimatedStartDate,
        actualStartDate,
        estimatedEndDate,
        actualEndDate,
      },
      {
        userId,
        companyId,
      }
    );

    res.status(201).json(newProject);
  } catch (error) {
    console.error("❌ POST project error:", error);
    res.status(500).json({ error: "Proje oluşturulamadı." });
  }
};

export const getCompanyProjectsHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const companyId = req.user!.companyId;

    const projects = await getCompanyProjects(companyId);

    res.status(200).json(projects);
  } catch (error) {
    console.error("❌ GET projects error:", error);
    res.status(500).json({ error: "Projeler alınamadı." });
  }
};

export const getProjectByIdHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user!.companyId;

    const project = await getProjectById(id, companyId);

    res.status(200).json(project);
  } catch (error) {
    console.error("❌ GET project by ID error:", error);
    res.status(404).json({ error: "Proje bulunamadı." });
  }
};
