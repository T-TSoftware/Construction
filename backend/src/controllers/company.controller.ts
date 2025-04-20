// src/controllers/company.controller.ts
import { Request, Response } from "express";
import {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
} from "../services/company.service";

export const getCompanies = async (_: Request, res: Response) => {
  const companies = await getAllCompanies();
  res.json(companies);
};

export const getCompany = async (req: Request, res: Response) => {
  const company = await getCompanyById(req.params.id);
  if (!company) {
    res.status(404).json({ error: "Company not found" });
    return;
  }
  res.json(company);
};

export const postCompany = async (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name) {
    res.status(400).json({ error: "name is required" });
    return;
  }

  const newCompany = await createCompany(name);
  res.status(201).json(newCompany);
};

export const putCompany = async (req: Request, res: Response) => {
  const { name } = req.body;
  const updated = await updateCompany(req.params.id, name);
  if (!updated) return res.status(404).json({ error: "Company not found" });
  res.json(updated);
};

export const removeCompany = async (req: Request, res: Response) => {
  const deleted = await deleteCompany(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Company not found" });
  res.status(204).send();
};
