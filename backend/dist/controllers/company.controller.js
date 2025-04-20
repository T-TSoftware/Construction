"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeCompany = exports.putCompany = exports.postCompany = exports.getCompany = exports.getCompanies = void 0;
const company_service_1 = require("../services/company.service");
const getCompanies = async (_, res) => {
    const companies = await (0, company_service_1.getAllCompanies)();
    res.json(companies);
};
exports.getCompanies = getCompanies;
const getCompany = async (req, res) => {
    const company = await (0, company_service_1.getCompanyById)(req.params.id);
    if (!company) {
        res.status(404).json({ error: "Company not found" });
        return;
    }
    res.json(company);
};
exports.getCompany = getCompany;
const postCompany = async (req, res) => {
    const { name } = req.body;
    if (!name) {
        res.status(400).json({ error: "name is required" });
        return;
    }
    const newCompany = await (0, company_service_1.createCompany)(name);
    res.status(201).json(newCompany);
};
exports.postCompany = postCompany;
const putCompany = async (req, res) => {
    const { name } = req.body;
    const updated = await (0, company_service_1.updateCompany)(req.params.id, name);
    if (!updated)
        return res.status(404).json({ error: "Company not found" });
    res.json(updated);
};
exports.putCompany = putCompany;
const removeCompany = async (req, res) => {
    const deleted = await (0, company_service_1.deleteCompany)(req.params.id);
    if (!deleted)
        return res.status(404).json({ error: "Company not found" });
    res.status(204).send();
};
exports.removeCompany = removeCompany;
