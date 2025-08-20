"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectById = exports.getCompanyProjects = exports.createProject = void 0;
const data_source_1 = require("../config/data-source");
const CompanyProject_1 = require("../entities/CompanyProject");
const Company_1 = require("../entities/Company");
const persist_1 = require("../utils/persist");
const sanitizeRules_1 = require("../utils/sanitizeRules");
const sanitize_1 = require("../utils/sanitize");
const projectRepo = data_source_1.AppDataSource.getRepository(CompanyProject_1.CompanyProject);
const companyRepo = data_source_1.AppDataSource.getRepository(Company_1.Company);
const createProject = async (data, currentUser) => {
    const company = await companyRepo.findOneByOrFail({
        id: currentUser.companyId,
    });
    const projectName = data.name.trim().replace(/\s+/g, "").toUpperCase();
    const code = `${projectName}`;
    const project = projectRepo.create({
        ...data,
        code,
        company: { id: company.id },
        createdBy: { id: currentUser.userId },
        updatedBy: { id: currentUser.userId },
    });
    //return await projectRepo.save(project);
    return await (0, persist_1.saveRefetchSanitize)({
        entityName: "CompanyProject",
        save: () => projectRepo.save(project),
        refetch: () => projectRepo.findOneOrFail({
            where: { id: project.id, company: { id: currentUser.companyId } },
            relations: [
                "company",
                "createdBy",
                "updatedBy",
            ],
        }),
        rules: sanitizeRules_1.sanitizeRules,
        defaultError: "Proje kaydı oluşturulamadı.",
    });
};
exports.createProject = createProject;
const getCompanyProjects = async (companyId) => {
    const projects = await projectRepo.find({
        where: { company: { id: companyId } },
        relations: ["createdBy", "updatedBy", "company"],
        order: { createdatetime: "DESC" },
    });
    return (0, sanitize_1.sanitizeEntity)(projects, "CompanyProject", sanitizeRules_1.sanitizeRules);
};
exports.getCompanyProjects = getCompanyProjects;
const getProjectById = async (id, companyId) => {
    const project = await projectRepo.findOne({
        where: {
            id,
            company: { id: companyId },
        },
        relations: ["createdBy", "updatedBy", "company"],
    });
    if (!project) {
        throw new Error("Proje bulunamadı.");
    }
    return (0, sanitize_1.sanitizeEntity)(project, "CompanyProject", sanitizeRules_1.sanitizeRules);
};
exports.getProjectById = getProjectById;
