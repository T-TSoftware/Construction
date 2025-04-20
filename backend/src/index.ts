// src/index.ts
import express from "express";
import cors from "cors";
import { AppDataSource } from "./config/data-source";
import dotenv from "dotenv";

import companyRoutes from "./routes/company.routes";
import companyBalanceRoutes from "./routes/companyBalance.routes";
import authRoutes from "./routes/auth.routes";
import companyProjectRoutes from "./routes/companyProject.routes";
import estimatedCostRoutes from "./routes/projectEstimatedCost.routes";
import supplierRoutes from "./routes/projectSupplier.routes";
import subcontractorRoutes from "./routes/projectSubcontractor.routes";
import quantityItemRoutes from "./routes/quantityItem.routes";
import projectQuantityRoutes from "./routes/projectQuantity.routes";
import projectCostSummaryRoutes from "./routes/projectCostSummary.routes";

dotenv.config();

const app = express();

// ✨ CORS middleware
app.use(
  cors({
    origin: "http://localhost:5173", // sadece Vite frontend'den istek gelsin
    credentials: true, // eğer cookie/token gibi bilgiler gönderiyorsan
  })
);

app.use(express.json());

app.use("/api/companies", companyRoutes);
app.use("/api/balances", companyBalanceRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/projects", companyProjectRoutes);
app.use("/api/quantity-items", quantityItemRoutes);

app.use("/api", estimatedCostRoutes);
app.use("/api", supplierRoutes);
app.use("/api", subcontractorRoutes);
app.use("/api", projectQuantityRoutes);
app.use("/api", projectCostSummaryRoutes);

const PORT = process.env.PORT;

AppDataSource.initialize()
  .then(() => {
    console.log("📦 Data Source has been initialized!");

    app.get("/", (_, res) => {
      res.send("TypeORM + Multi-Tenant API is live 💼");
    });

    app.listen(3000, () => {
      console.log(`🚀 Server is running at http://localhost:${PORT}`);
    });
  })
  .catch((error) =>
    console.error("Error during Data Source initialization", error)
  );
