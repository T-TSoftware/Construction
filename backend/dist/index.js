"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const data_source_1 = require("./config/data-source");
const company_routes_1 = __importDefault(require("./routes/company.routes"));
const companyBalance_routes_1 = __importDefault(require("./routes/companyBalance.routes"));
const companyProject_routes_1 = __importDefault(require("./routes/companyProject.routes"));
const companyStock_routes_1 = __importDefault(require("./routes/companyStock.routes"));
const companyFinance_routes_1 = __importDefault(require("./routes/companyFinance.routes"));
const companyBankMovement_routes_1 = __importDefault(require("./routes/companyBankMovement.routes"));
const projectEstimatedCost_routes_1 = __importDefault(require("./routes/projectEstimatedCost.routes"));
const projectSupplier_routes_1 = __importDefault(require("./routes/projectSupplier.routes"));
const projectSubcontractor_routes_1 = __importDefault(require("./routes/projectSubcontractor.routes"));
const projectQuantity_routes_1 = __importDefault(require("./routes/projectQuantity.routes"));
const projectCostSummary_routes_1 = __importDefault(require("./routes/projectCostSummary.routes"));
const projectCurrent_routes_1 = __importDefault(require("./routes/projectCurrent.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const quantityItem_routes_1 = __importDefault(require("./routes/quantityItem.routes"));
const stockItem_routes_1 = __importDefault(require("./routes/stockItem.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// ✨ CORS middleware
app.use((0, cors_1.default)({
    origin: "http://localhost:5173", // sadece Vite frontend'den istek gelsin
    credentials: true, // eğer cookie/token gibi bilgiler gönderiyorsan
}));
app.use(express_1.default.json());
app.use("/api/auth", auth_routes_1.default);
// Company Related
app.use("/api/companies", company_routes_1.default);
app.use("/api/projects", companyProject_routes_1.default);
app.use("/api/stocks", companyStock_routes_1.default);
app.use("/api/balances", companyBalance_routes_1.default);
app.use("/api/finances", companyFinance_routes_1.default);
app.use("/api/bank-movements", companyBankMovement_routes_1.default);
// Project Related
app.use("/api", projectEstimatedCost_routes_1.default);
app.use("/api", projectSupplier_routes_1.default);
app.use("/api", projectSubcontractor_routes_1.default);
app.use("/api", projectQuantity_routes_1.default);
app.use("/api", projectCostSummary_routes_1.default);
app.use("/api", projectCurrent_routes_1.default);
// Masterdata Related
app.use("/api/quantity-items", quantityItem_routes_1.default);
app.use("/api/stock-items", stockItem_routes_1.default);
const PORT = process.env.PORT;
data_source_1.AppDataSource.initialize()
    .then(() => {
    console.log("📦 Data Source has been initialized!");
    app.get("/", (_, res) => {
        res.send("TypeORM + Multi-Tenant API is live 💼");
    });
    app.listen(3000, () => {
        console.log(`🚀 Server is running at http://localhost:${PORT}`);
    });
})
    .catch((error) => console.error("Error during Data Source initialization", error));
