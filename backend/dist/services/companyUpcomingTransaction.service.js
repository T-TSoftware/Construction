"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUpcomingCollections = exports.getUpcomingPayments = void 0;
const data_source_1 = require("../config/data-source");
const getUpcomingPayments = async (currentUser, query) => {
    const conditions = [`companyid = $1`];
    const params = [currentUser.companyId];
    if (query.startDate) {
        conditions.push(`dueDate >= $${params.length + 1}`);
        params.push(query.startDate);
    }
    if (query.endDate) {
        conditions.push(`dueDate <= $${params.length + 1}`);
        params.push(query.endDate);
    }
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const sql = `
    SELECT *
    FROM artikonsept.v_upcomingpayments
    ${whereClause}
    ORDER BY duedate ASC
  `;
    return await data_source_1.AppDataSource.manager.query(sql, params);
};
exports.getUpcomingPayments = getUpcomingPayments;
const getUpcomingCollections = async (currentUser, query) => {
    const conditions = [`companyid = $1`];
    const params = [currentUser.companyId];
    if (query.startDate) {
        conditions.push(`dueDate >= $${params.length + 1}`);
        params.push(query.startDate);
    }
    if (query.endDate) {
        conditions.push(`dueDate <= $${params.length + 1}`);
        params.push(query.endDate);
    }
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const sql = `
    SELECT *
    FROM artikonsept.v_upcomingcollections
    ${whereClause}
    ORDER BY duedate ASC
  `;
    return await data_source_1.AppDataSource.manager.query(sql, params);
};
exports.getUpcomingCollections = getUpcomingCollections;
