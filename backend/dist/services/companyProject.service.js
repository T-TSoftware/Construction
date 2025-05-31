"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectById = exports.getCompanyProjects = exports.createProject = void 0;
const data_source_1 = require("../config/data-source");
const CompanyProject_1 = require("../entities/CompanyProject");
const Company_1 = require("../entities/Company");
const generateCode_1 = require("../utils/generateCode");
const projectRepo = data_source_1.AppDataSource.getRepository(CompanyProject_1.CompanyProject);
const companyRepo = data_source_1.AppDataSource.getRepository(Company_1.Company);
const createProject = async (data, currentUser) => {
    const company = await companyRepo.findOneByOrFail({
        id: currentUser.companyId,
    });
    const projectPrefix = data.site
        .trim()
        .split(" ")[0]
        .slice(0, 3)
        .toUpperCase();
    const codePrefix = `${company.code
        .slice(0, 3)
        .toUpperCase()}-${projectPrefix}`;
    const latestProject = await projectRepo
        .createQueryBuilder("project")
        .where("project.code LIKE :prefix", { prefix: `${codePrefix}%` })
        .andWhere("project.companyId = :companyId", { companyId: company.id })
        .orderBy("project.code", "DESC")
        .getOne();
    const latestCode = latestProject?.code ?? null;
    const code = (0, generateCode_1.generateNextProjectCode)(latestCode, company.code, data.site);
    const project = projectRepo.create({
        ...data,
        code,
        company: { id: company.id },
        createdBy: { id: currentUser.userId },
        updatedBy: { id: currentUser.userId },
    });
    return await projectRepo.save(project);
};
exports.createProject = createProject;
const getCompanyProjects = async (companyId) => {
    const projects = await projectRepo.find({
        where: { company: { id: companyId } },
        relations: ["createdBy", "updatedBy"],
        order: { createdatetime: "DESC" },
    });
    return projects.map((project) => ({
        id: project.id,
        code: project.code,
        name: project.name,
        site: project.site,
        status: project.status,
        estimatedStartDate: project.estimatedStartDate,
        actualStartDate: project.actualStartDate,
        estimatedEndDate: project.estimatedEndDate,
        actualEndDate: project.actualEndDate,
        createdBy: project.createdBy?.name ?? null,
        updatedBy: project.updatedBy?.name ?? null,
        createdatetime: project.createdatetime,
        updatedatetime: project.updatedatetime,
    }));
};
exports.getCompanyProjects = getCompanyProjects;
const getProjectById = async (id, companyId) => {
    const project = await projectRepo.findOne({
        where: {
            id,
            company: { id: companyId },
        },
        relations: ["createdBy", "updatedBy"],
    });
    if (!project) {
        throw new Error("Proje bulunamadı.");
    }
    return {
        code: project.code,
        name: project.name,
        site: project.site,
        status: project.status,
        estimatedStartDate: project.estimatedStartDate,
        actualStartDate: project.actualStartDate,
        estimatedEndDate: project.estimatedEndDate,
        actualEndDate: project.actualEndDate,
        createdBy: project.createdBy?.name ?? null,
        updatedBy: project.updatedBy?.name ?? null,
        createdatetime: project.createdatetime,
        updatedatetime: project.updatedatetime,
    };
};
exports.getProjectById = getProjectById;
