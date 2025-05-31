"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBankMovements = void 0;
const data_source_1 = require("../config/data-source");
const getBankMovements = async (filters) => {
    const conditions = [];
    const params = [];
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
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const sql = `
    SELECT *
    FROM artikonsept.v_bankmovements
    ${whereClause.toLowerCase()}
    ORDER BY "transactiondate" DESC
  `;
    return await data_source_1.AppDataSource.manager.query(sql, params);
};
exports.getBankMovements = getBankMovements;
