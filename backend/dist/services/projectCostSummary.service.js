"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectCostSummary = void 0;
const data_source_1 = require("../config/data-source");
const ProjectCostSummaryView_1 = require("../views/ProjectCostSummaryView");
const viewRepo = data_source_1.AppDataSource.getRepository(ProjectCostSummaryView_1.ProjectCostSummary);
const getProjectCostSummary = async (projectId) => {
    return await viewRepo.find({
        where: { projectid: projectId },
        order: { quantityitemname: "ASC" },
    });
};
exports.getProjectCostSummary = getProjectCostSummary;
