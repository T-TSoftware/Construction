"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectCostSummary = void 0;
const data_source_1 = require("../config/data-source");
const getProjectCostSummary = async (projectId, currentUser, filters = {}) => {
    const conditions = [`projectid = $1`, `companyid = $2`];
    const params = [projectId, currentUser.companyId];
    if (filters.quantityItemCode) {
        conditions.push(`quantityitemcode = $${params.length + 1}`);
        params.push(filters.quantityItemCode);
    }
    if (filters.overlimitYn) {
        conditions.push(`overlimit = $${params.length + 1}`);
        params.push(filters.overlimitYn);
    }
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const sql = `
    SELECT *
    FROM artikonsept.v_projectcostsummary
    ${whereClause.toLowerCase()}
  `;
    return await data_source_1.AppDataSource.manager.query(sql, params);
};
exports.getProjectCostSummary = getProjectCostSummary;
