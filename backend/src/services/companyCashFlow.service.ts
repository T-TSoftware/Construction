import { AppDataSource } from "../config/data-source";

export const getDailyCashflow = async (
  currentUser: { companyId: string },
  query: {
    startDate?: string;
    endDate?: string;
    method?: string;
    transactionDate?: string;
  }
) => {
  const conditions: string[] = [`companyid = $1`];
  const params: any[] = [currentUser.companyId];

  if (query.startDate) {
    conditions.push(`transactionDate >= $${params.length + 1}`);
    params.push(query.startDate);
  }

  if (query.endDate) {
    conditions.push(`transactionDate <= $${params.length + 1}`);
    params.push(query.endDate);
  }

  if (query.transactionDate) {
    conditions.push(`"transactionDate" = $${params.length + 1}`);
    params.push(query.transactionDate);
  }

  if (query.method) {
    conditions.push(`method = $${params.length + 1}`);
    params.push(query.method);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const sql = `
    SELECT *
    FROM artikonsept.v_cashflow
    ${whereClause.toLowerCase()}
    ORDER BY transactionDate DESC
  `;

  return await AppDataSource.manager.query(sql, params);
};
