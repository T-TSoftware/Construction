"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutHandler = exports.registerHandler = exports.loginHandler = void 0;
const data_source_1 = require("../config/data-source");
const User_1 = require("../entities/User");
const jwt_1 = require("../utils/jwt");
const auth_service_1 = require("../services/auth.service");
const tokenBlackList_1 = require("../utils/tokenBlackList");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userRepo = data_source_1.AppDataSource.getRepository(User_1.User);
const loginHandler = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: "Email and password are required." });
            return;
        }
        const result = await (0, auth_service_1.loginUser)(email, password);
        res.status(200).json(result);
    }
    catch (error) {
        console.error("❌ Login error:", error);
        res.status(401).json({ error: error.message || "Login failed." });
    }
};
exports.loginHandler = loginHandler;
// export const registerHandler = async (req: Request, res: Response) => {
//   try {
//     const { name, email, password, role, companyId } = req.body;
//     if (!name || !email || !password || !role || !companyId) {
//       res.status(400).json({ error: "All fields are required." });
//       return;
//     }
//     const user = await registerUser({ name, email, password, role, companyId });
//     res.status(201).json(user);
//   } catch (error: any) {
//     console.error("❌ Register error:", error);
//     res.status(400).json({ error: error.message || "Register failed." });
//   }
// };
const registerHandler = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password || !role) {
            res.status(400).json({ error: "All fields are required." });
            return;
        }
        const createdByCompanyId = req.user.companyId;
        const user = await (0, auth_service_1.registerUser)({
            name,
            email,
            password,
            role,
            createdByCompanyId,
        });
        res.status(201).json(user);
    }
    catch (error) {
        console.error("❌ Register error:", error);
        res.status(400).json({ error: error.message || "Register failed." });
    }
};
exports.registerHandler = registerHandler;
const logoutHandler = async (req, res) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    const token = header.split(" ")[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const exp = (0, jwt_1.decodeExp)(token);
        if (!exp) {
            res.status(400).json({ error: "Invalid token" });
            return;
        }
        await (0, tokenBlackList_1.blacklistJti)(decoded.jti, exp);
        res.status(200).json({ message: "Logged out" });
    }
    catch {
        res.status(401).json({ error: "Invalid token" });
    }
};
exports.logoutHandler = logoutHandler;
