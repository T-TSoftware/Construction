"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
// src/config/data-source.ts
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const Company_1 = require("../entities/Company");
const dotenv_1 = __importDefault(require("dotenv"));
const CompanyBalance_1 = require("../entities/CompanyBalance");
const CompanyBalanceView_1 = require("../views/CompanyBalanceView");
const User_1 = require("../entities/User");
const CompanyProject_1 = require("../entities/CompanyProject");
dotenv_1.default.config();
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "xxxxx",
    port: Number(process.env.DB_PORT) || 1111,
    username: process.env.DB_USER || "xxxxx",
    password: process.env.DB_PASSWORD || "xxxx",
    database: process.env.DB_NAME || "xxxx",
    schema: process.env.DB_SCHEMA,
    synchronize: false, // Otomatik tablo oluşturma (Prod için false olmalı)
    logging: false,
    entities: [Company_1.Company, CompanyBalance_1.CompanyBalance, User_1.User, CompanyProject_1.CompanyProject, CompanyBalanceView_1.CompanyBalanceView],
    migrations: ["src/migrations/*.ts"],
    subscribers: [],
});
