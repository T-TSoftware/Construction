// src/config/data-source.ts
import "reflect-metadata";
import { DataSource } from "typeorm";
import { Company } from "../entities/Company";
import dotenv from "dotenv";
import { CompanyBalance } from "../entities/CompanyBalance";

import { User } from "../entities/User";
import { CompanyProject } from "../entities/CompanyProject";
import { ProjectEstimatedCost } from "../entities/ProjectEstimatedCost";
import { ProjectSupplier } from "../entities/ProjectSupplier";
import { ProjectSubcontractor } from "../entities/ProjectSubcontractor";
import { QuantityItem } from "../entities/QuantityItem";
import { ProjectQuantity } from "../entities/ProjectQuantity";
import { ProjectCurrent } from "../entities/ProjectCurrent";
import { CompanyStock } from "../entities/CompanyStock";
import { StockItem } from "../entities/StockItem";
import { CompanyFinanceTransaction } from "../entities/CompanyFinance";
import { CompanyCheck } from "../entities/CompanyCheck";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "xxxxx",
  port: Number(process.env.DB_PORT) || 1010,
  username: process.env.DB_USER || "xxxxx",
  password: process.env.DB_PASSWORD || "xxxx",
  database: process.env.DB_NAME || "xxxx",
  schema: process.env.DB_SCHEMA,
  synchronize: false, // Auto create table (Prod :false)
  logging: false,
  entities: [
    /*-------------------------*/
    // Company Related
    Company,
    CompanyBalance,
    CompanyProject,
    CompanyStock,
    CompanyFinanceTransaction,
    CompanyCheck,

    /*-------------------------*/

    // Project Related
    ProjectEstimatedCost,
    ProjectSupplier,
    ProjectSubcontractor,
    ProjectQuantity,
    ProjectCurrent,

    /*-------------------------*/

    // User
    User,

    /*-------------------------*/

    // Master
    QuantityItem,
    //StockItem,

    /*-------------------------*/

  ],
  migrations: ["src/migrations/*.ts"],
  //migrations: ["src/migrations/1747655234423-masterdataStockItem.ts"],
  subscribers: [],
});

// npx tsc
//npx typeorm-ts-node-commonjs migration:generate src/migrations/adjustedFinTran --dataSource src/config/data-source.ts
//npx typeorm-ts-node-commonjs migration:run --dataSource src/config/data-source.ts
