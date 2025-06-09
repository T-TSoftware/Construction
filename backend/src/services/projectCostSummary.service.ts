import { AppDataSource } from "../config/data-source";

export const getProjectCostSummary = async (
  projectId: string,
  currentUser: { companyId: string },
  filters: {
    quantityItemCode?: string;
    overlimitYn?: string;
  } = {}
) => {
  const conditions: string[] = [`projectid = $1`, `companyid = $2`];
  const params: any[] = [projectId, currentUser.companyId];

  if (filters.quantityItemCode) {
    conditions.push(`quantityitemcode = $${params.length + 1}`);
    params.push(filters.quantityItemCode);
  }

  if (filters.overlimitYn) {
    conditions.push(`overlimit = $${params.length + 1}`);
    params.push(filters.overlimitYn);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const sql = `
    SELECT *
    FROM artikonsept.v_projectcostsummary
    ${whereClause.toLowerCase()}
  `;

  return await AppDataSource.manager.query(sql, params);
};
