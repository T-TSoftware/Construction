import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { AppDataSource } from "./config/data-source";
//import AppDataSource from "./config/data-source";
import companyRoutes from "./routes/company.routes";
import companyBalanceRoutes from "./routes/companyBalance.routes";
import companyProjectRoutes from "./routes/companyProject.routes";
import companyStockRoutes from "./routes/companyStock.routes";
import companyFinanceRoutes from "./routes/companyFinance.routes";
import companyBankMovementRoutes from "./routes/companyBankMovement.routes";
import companyCurrentMovementRoutes from "./routes/companyCurrentMovement.routes";
import companyCashFlowRoutes from "./routes/companyCashFlow.routes";
import companyCheckRoutes from "./routes/companyCheck.routes";
import companyOrderRoutes from "./routes/companyOrder.routes";
import companyLoanRoutes from "./routes/companyLoan.routes";
import companyLoanPaymentRoutes from "./routes/companyLoanPayment.routes";
import companyEmployeeRoutes from "./routes/companyEmployee.routes";
import companyEmployeeLeaveRoutes from "./routes/companyEmployeeLeave.routes";
import companyBarterAgreementRoutes from "./routes/companyBarterAgreement.routes";
import companyBarterAgreementItemRoutes from "./routes/companyBarterAgreementItem.routes";
import companyBarterItemCashDetailRoutes from "./routes/companyBarterItemCashDetail.routes";
import companyUpcomingTransactionRoutes from "./routes/companyUpcomingTransaction.routes";

import projectEstimatedCostRoutes from "./routes/projectEstimatedCost.routes";
import projectSupplierRoutes from "./routes/projectSupplier.routes";
import projectSubcontractorRoutes from "./routes/projectSubcontractor.routes";
import projectQuantityRoutes from "./routes/projectQuantity.routes";
import projectCostSummaryRoutes from "./routes/projectCostSummary.routes";
import projectCurrentRoutes from "./routes/projectCurrent.routes";
import projectBarterAgreementRoutes from "./routes/companyBarterAgreement.routes";

import authRoutes from "./routes/auth.routes";

import quantityItemRoutes from "./routes/quantityItem.routes";
import stockItemRoutes from "./routes/stockItem.routes";

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
app.use("/api/auth", authRoutes);
// Company Related
app.use("/api/companies", companyRoutes);
app.use("/api/projects", companyProjectRoutes);
app.use("/api/stocks", companyStockRoutes);
app.use("/api/balances", companyBalanceRoutes);
app.use("/api/finances", companyFinanceRoutes);
app.use("/api/checks", companyCheckRoutes);
app.use("/api/orders", companyOrderRoutes);
app.use("/api/loans", companyLoanRoutes);
app.use("/api/loan-payments", companyLoanPaymentRoutes);
app.use("/api/employees", companyEmployeeRoutes);
app.use("/api/employee-leaves", companyEmployeeLeaveRoutes);
app.use("/api/barters", companyBarterAgreementRoutes);
app.use("/api/barter-items", companyBarterAgreementItemRoutes);
app.use("/api/barter-cashes", companyBarterItemCashDetailRoutes);
app.use("/api/upcoming", companyUpcomingTransactionRoutes);

app.use("/api/bank-movements", companyBankMovementRoutes);
app.use("/api/current-movements", companyCurrentMovementRoutes);
app.use("/api/cash-flow", companyCashFlowRoutes);

// Project Related
app.use("/api", projectEstimatedCostRoutes);
app.use("/api", projectSupplierRoutes);
app.use("/api", projectSubcontractorRoutes);
app.use("/api", projectQuantityRoutes);
app.use("/api", projectCostSummaryRoutes);
app.use("/api", projectCurrentRoutes);
//app.use("/api", projectBarterAgreementRoutes);

// Masterdata Related
app.use("/api/quantity-items", quantityItemRoutes);
app.use("/api/stock-items", stockItemRoutes);

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
  .then(() => {
    console.log("📦 Data Source has been initialized!");

    app.get("/", (_, res) => {
      res.send("TypeORM + Multi-Tenant API is live 💼");
    });

    app.listen(PORT, () => {
      console.log(`🚀 Server is running at http://localhost:${PORT}`);
    });
  })
  .catch((error) =>
    console.error("Error during Data Source initialization", error)
  );
