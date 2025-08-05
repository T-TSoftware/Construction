import { AppDataSource } from "../config/data-source";

export const getUpcomingPayments = async (
  currentUser: { companyId: string },
  query: {
    startDate?: string;
    endDate?: string;
  }
) => {
  const conditions: string[] = [`companyid = $1`];
  const params: any[] = [currentUser.companyId];

  if (query.startDate) {
    conditions.push(`dueDate >= $${params.length + 1}`);
    params.push(query.startDate);
  }

  if (query.endDate) {
    conditions.push(`dueDate <= $${params.length + 1}`);
    params.push(query.endDate);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const sql = `
    SELECT *
    FROM artikonsept.v_upcomingpayments
    ${whereClause}
    ORDER BY duedate ASC
  `;

  return await AppDataSource.manager.query(sql, params);
};

export const getUpcomingCollections = async (
  currentUser: { companyId: string },
  query: {
    startDate?: string;
    endDate?: string;
  }
) => {
  const conditions: string[] = [`companyid = $1`];
  const params: any[] = [currentUser.companyId];

  if (query.startDate) {
    conditions.push(`dueDate >= $${params.length + 1}`);
    params.push(query.startDate);
  }

  if (query.endDate) {
    conditions.push(`dueDate <= $${params.length + 1}`);
    params.push(query.endDate);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const sql = `
    SELECT *
    FROM artikonsept.v_upcomingcollections
    ${whereClause}
    ORDER BY duedate ASC
  `;

  return await AppDataSource.manager.query(sql, params);
};
