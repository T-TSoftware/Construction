"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectByIdHandler = exports.getCompanyProjectsHandler = exports.postCompanyProjectHandler = void 0;
const companyProject_service_1 = require("../services/companyProject.service");
const postCompanyProjectHandler = async (req, res) => {
    if (req.user?.role !== "superadmin") {
        res.status(403).json({ error: "Yalnızca superadmin işlemi yapabilir." });
        return;
    }
    try {
        const { name, site, status, estimatedStartDate, actualStartDate, estimatedEndDate, actualEndDate, } = req.body;
        const userId = req.user.userId.toString();
        const companyId = req.user.companyId;
        const newProject = await (0, companyProject_service_1.createProject)({
            name,
            site,
            status,
            estimatedStartDate,
            actualStartDate,
            estimatedEndDate,
            actualEndDate,
        }, {
            userId,
            companyId,
        });
        res.status(201).json(newProject);
    }
    catch (error) {
        console.error("❌ POST project error:", error);
        res.status(500).json({
            errorMessage: error.message || "Proje kaydedilemedi.",
        });
    }
};
exports.postCompanyProjectHandler = postCompanyProjectHandler;
const getCompanyProjectsHandler = async (req, res) => {
    try {
        const companyId = req.user.companyId;
        const projects = await (0, companyProject_service_1.getCompanyProjects)(companyId);
        res.status(200).json(projects);
    }
    catch (error) {
        console.error("❌ GET projects error:", error);
        res.status(500).json({ error: "Projeler alınamadı." });
    }
};
exports.getCompanyProjectsHandler = getCompanyProjectsHandler;
const getProjectByIdHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const companyId = req.user.companyId;
        const project = await (0, companyProject_service_1.getProjectById)(id, companyId);
        res.status(200).json(project);
    }
    catch (error) {
        console.error("❌ GET project by ID error:", error);
        res.status(404).json({ error: "Proje bulunamadı." });
    }
};
exports.getProjectByIdHandler = getProjectByIdHandler;
