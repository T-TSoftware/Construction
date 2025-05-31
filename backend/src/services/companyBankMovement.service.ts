import { AppDataSource } from "../config/data-source";

export const getBankMovements = async (filters: {
  projectId?: string;
  startDate?: string;
  endDate?: string;
  code?: string;
}) => {
  const conditions: string[] = [];
  const params: any[] = [];

  if (filters.projectId) {
    conditions.push(`"projectId" = $${params.length + 1}`);
    params.push(filters.projectId);
  }

  if (filters.code) {
    conditions.push(`"code" = $${params.length + 1}`);
    params.push(filters.code);
  }

  if (filters.startDate) {
    conditions.push(`"transactionDate" >= $${params.length + 1}`);
    params.push(filters.startDate);
  }

  if (filters.endDate) {
    conditions.push(`"transactionDate" <= $${params.length + 1}`);
    params.push(filters.endDate);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const sql = `
    SELECT *
    FROM artikonsept.v_bankmovements
    ${whereClause.toLowerCase()}
    ORDER BY "transactiondate" DESC
  `;

  return await AppDataSource.manager.query(sql, params);
};
