"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
const express_1 = __importDefault(require("express"));
const data_source_1 = require("./config/data-source");
const dotenv_1 = __importDefault(require("dotenv"));
const company_routes_1 = __importDefault(require("./routes/company.routes"));
const companyBalance_routes_1 = __importDefault(require("./routes/companyBalance.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use("/api/companies", company_routes_1.default); // ✅ Router nesnesi veriyoruz
app.use("/api/balances", companyBalance_routes_1.default);
app.use("/api/auth", auth_routes_1.default);
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
