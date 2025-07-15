"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDailyCashflow = void 0;
const data_source_1 = require("../config/data-source");
const getDailyCashflow = async (currentUser, query) => {
    const conditions = [`companyid = $1`];
    const params = [currentUser.companyId];
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
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const sql = `
    SELECT *
    FROM artikonsept.v_cashflow
    ${whereClause.toLowerCase()}
    ORDER BY transactionDate DESC
  `;
    return await data_source_1.AppDataSource.manager.query(sql, params);
};
exports.getDailyCashflow = getDailyCashflow;
