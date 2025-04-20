import { AppDataSource } from "../config/data-source";
import { ProjectCostSummary } from "../views/ProjectCostSummaryView";

const viewRepo = AppDataSource.getRepository(ProjectCostSummary);

export const getProjectCostSummary = async (projectId: string) => {
  return await viewRepo.find({
    where: { projectid: projectId },
    order: { quantityitemname: "ASC" },
  });
};
