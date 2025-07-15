"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentMovements = void 0;
const data_source_1 = require("../config/data-source");
const getCurrentMovements = async (currentUser, filters) => {
    const conditions = [`"companyid" = $1`];
    const params = [currentUser.companyId];
    if (filters.project) {
        conditions.push(`"project" = $${params.length + 1}`);
        params.push(filters.project);
    }
    if (filters.transactiondate) {
        conditions.push(`"transactiondate" = $${params.length + 1}`);
        params.push(filters.transactiondate);
    }
    if (filters.description) {
        conditions.push(`LOWER("description") LIKE LOWER($${params.length + 1})`);
        params.push(`%${filters.description}%`);
    }
    if (filters.firm) {
        conditions.push(`LOWER("firm") LIKE LOWER($${params.length + 1})`);
        params.push(`%${filters.firm}%`);
    }
    if (typeof filters.income === "number") {
        conditions.push(`"income" = $${params.length + 1}`);
        params.push(filters.income);
    }
    if (typeof filters.expense === "number") {
        conditions.push(`"expense" = $${params.length + 1}`);
        params.push(filters.expense);
    }
    if (filters.invoiceyn) {
        conditions.push(`"invoiceyn" = $${params.length + 1}`);
        params.push(filters.invoiceyn);
    }
    /*if (filters.invoicecode) {
      conditions.push(`LOWER("invoicecode") LIKE LOWER($${params.length + 1})`);
      params.push(`%${filters.invoicecode}%`);
    }*/
    if (filters.category) {
        conditions.push(`LOWER("category") LIKE LOWER($${params.length + 1})`);
        params.push(`%${filters.category}%`);
    }
    /*if (filters.checkcode) {
      conditions.push(`"checkcode" IS NOT NULL($${params.length + 1})`);
      params.push(`%${filters.checkcode}%`);
    }*/
    if (filters.startDate) {
        conditions.push(`"transactiondate" >= $${params.length + 1}`);
        params.push(filters.startDate);
    }
    if (filters.endDate) {
        conditions.push(`"transactiondate" <= $${params.length + 1}`);
        params.push(filters.endDate);
    }
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const sql = `
    SELECT *
    FROM artikonsept.v_currentmovements
    ${whereClause.toLowerCase()}
    ORDER BY "transactiondate" DESC
  `;
    return await data_source_1.AppDataSource.manager.query(sql, params);
};
exports.getCurrentMovements = getCurrentMovements;
