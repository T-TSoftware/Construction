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
const User_1 = require("../entities/User");
const CompanyProject_1 = require("../entities/CompanyProject");
const ProjectEstimatedCost_1 = require("../entities/ProjectEstimatedCost");
const ProjectSupplier_1 = require("../entities/ProjectSupplier");
const ProjectSubcontractor_1 = require("../entities/ProjectSubcontractor");
const QuantityItem_1 = require("../entities/QuantityItem");
const ProjectQuantity_1 = require("../entities/ProjectQuantity");
const ProjectCurrent_1 = require("../entities/ProjectCurrent");
const CompanyStock_1 = require("../entities/CompanyStock");
const CompanyFinance_1 = require("../entities/CompanyFinance");
const CompanyCheck_1 = require("../entities/CompanyCheck");
const CompanyOrder_1 = require("../entities/CompanyOrder");
const CompanyLoan_1 = require("../entities/CompanyLoan");
const CompanyLoanPayment_1 = require("../entities/CompanyLoanPayment");
const CompanyEmployee_1 = require("../entities/CompanyEmployee");
const CompanyEmployeeLeave_1 = require("../entities/CompanyEmployeeLeave");
const CompanyEmployeeProject_1 = require("../entities/CompanyEmployeeProject");
const CompanyBarterAgreement_1 = require("../entities/CompanyBarterAgreement");
const CompanyBarterAgreementItem_1 = require("../entities/CompanyBarterAgreementItem");
const CompanyBarterItemCashDetail_1 = require("../entities/CompanyBarterItemCashDetail");
//dotenv.config();
const envFile = process.env.NODE_ENV === "production" ? ".env.prod" : ".env";
dotenv_1.default.config({ path: envFile });
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "xxxxx",
    port: Number(process.env.DB_PORT) || 1010,
    username: process.env.DB_USER || "xxxxx",
    password: process.env.DB_PASSWORD || "xxxx",
    database: process.env.DB_NAME || "xxxx",
    schema: process.env.DB_SCHEMA,
    synchronize: process.env.SYNCHRONIZE_ONCE === "true", //true, // Auto create table (Prod :false)
    logging: false,
    entities: [
        /*-------------------------*/
        // Company Related
        Company_1.Company,
        CompanyBalance_1.CompanyBalance,
        CompanyProject_1.CompanyProject,
        CompanyStock_1.CompanyStock,
        CompanyFinance_1.CompanyFinanceTransaction,
        CompanyCheck_1.CompanyCheck,
        CompanyOrder_1.CompanyOrder,
        CompanyLoan_1.CompanyLoan,
        CompanyLoanPayment_1.CompanyLoanPayment,
        CompanyEmployee_1.CompanyEmployee,
        CompanyEmployeeLeave_1.CompanyEmployeeLeave,
        CompanyEmployeeProject_1.CompanyEmployeeProject,
        CompanyBarterAgreement_1.CompanyBarterAgreement,
        CompanyBarterAgreementItem_1.CompanyBarterAgreementItem,
        CompanyBarterItemCashDetail_1.CompanyBarterCashDetail,
        /*-------------------------*/
        // Project Related
        ProjectEstimatedCost_1.ProjectEstimatedCost,
        ProjectSupplier_1.ProjectSupplier,
        ProjectSubcontractor_1.ProjectSubcontractor,
        ProjectQuantity_1.ProjectQuantity,
        ProjectCurrent_1.ProjectCurrent,
        /*-------------------------*/
        // User
        User_1.User,
        /*-------------------------*/
        // Master
        QuantityItem_1.QuantityItem,
        //StockItem,
        /*-------------------------*/
    ],
    //migrations: ["src/migrations/*.ts"],
    migrations: process.env.NODE_ENV === "production" ? [] : ["src/migrations/*.ts"], //  ← dev’de eskisi gibi
    //migrations: ["src/migrations/1747655234423-masterdataStockItem.ts"],
    subscribers: [],
});
//export default AppDataSource;
// npx tsc
//npx typeorm-ts-node-commonjs migration:generate src/migrations/UQX_companybalances --dataSource src/config/data-source.ts
//npx typeorm-ts-node-commonjs migration:run --dataSource src/config/data-source.ts
