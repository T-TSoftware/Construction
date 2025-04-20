"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateNextCompanyCode = generateNextCompanyCode;
exports.generateNextBalanceCode = generateNextBalanceCode;
exports.generateUserCode = generateUserCode;
function generateNextCompanyCode(latestCode, name) {
    const prefix = name.slice(0, 3).toUpperCase();
    if (!latestCode || !latestCode.startsWith(prefix))
        return `${prefix}001`;
    const num = parseInt(latestCode.replace(prefix, ""));
    const nextNum = (num + 1).toString().padStart(3, "0");
    return `${prefix}${nextNum}`;
}
function generateNextBalanceCode(latestCode, name) {
    const prefix = name.slice(0, 3).toUpperCase();
    if (!latestCode || !latestCode.startsWith(prefix))
        return `${prefix}001`;
    const num = parseInt(latestCode.replace(prefix, ""));
    const nextNum = (num + 1).toString().padStart(3, "0");
    return `${prefix}${nextNum}`;
}
function generateUserCode(companyCode, userName) {
    const companyPart = companyCode.slice(0, 3).toUpperCase().padEnd(3, "_");
    const userPart = userName.slice(0, 3).toUpperCase().padEnd(3, "_");
    return `${companyPart}-${userPart}`;
}
