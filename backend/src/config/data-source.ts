// src/config/data-source.ts
import "reflect-metadata";
import { DataSource } from "typeorm";
import { Company } from "../entities/Company";
import dotenv from "dotenv";
import { CompanyBalance } from "../entities/CompanyBalance";
import { CompanyBalanceView } from "../views/CompanyBalanceView";
import { ProjectCostSummary } from "../views/ProjectCostSummaryView";
import { User } from "../entities/User";
import { CompanyProject } from "../entities/CompanyProject";
import { ProjectEstimatedCost } from "../entities/ProjectEstimatedCost";
import { ProjectSupplier } from "../entities/ProjectSupplier";
import { ProjectSubcontractor } from "../entities/ProjectSubcontractor";
import { QuantityItem } from "../entities/QuantityItem";
import { ProjectQuantity } from "../entities/ProjectQuantity";

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
    Company,
    CompanyBalance,
    User,
    CompanyProject,
    ProjectEstimatedCost,
    ProjectSupplier,
    ProjectSubcontractor,
    QuantityItem,
    ProjectQuantity,
    ProjectCostSummary,
    CompanyBalanceView
  ],
  migrations: ["src/migrations/*.ts"],
  subscribers: [],
});
