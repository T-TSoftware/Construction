"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = exports.loginUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const data_source_1 = require("../config/data-source");
const User_1 = require("../entities/User");
const jwt_1 = require("../utils/jwt");
const Company_1 = require("../entities/Company");
const generateCode_1 = require("../utils/generateCode");
const userRepo = data_source_1.AppDataSource.getRepository(User_1.User);
const companyRepo = data_source_1.AppDataSource.getRepository(Company_1.Company);
const loginUser = async (email, password) => {
    const user = await userRepo.findOne({
        where: { email },
        relations: ["company"],
    });
    if (!user || !(await bcrypt_1.default.compare(password, user.password))) {
        throw new Error("Invalid email or password");
    }
    const token = (0, jwt_1.generateToken)({
        userId: user.id,
        companyId: user.company.id,
        role: user.role,
    });
    return token;
};
exports.loginUser = loginUser;
// export const registerUser = async (data: {
//   name: string;
//   email: string;
//   password: string;
//   role: string;
//   companyId: string;
// }) => {
//   const existing = await userRepo.findOne({ where: { email: data.email } });
//   if (existing) throw new Error("Bu e-mail ile zaten bir kullanıcı mevcut.");
//   const hashedPassword = await bcrypt.hash(data.password, 10);
//   const newUser = userRepo.create({
//     ...data,
//     password: hashedPassword,
//     code: "", // generate logic eklenecek istersen
//     company: { id: data.companyId },
//   });
//   return await userRepo.save(newUser);
// };
const registerUser = async (data) => {
    const existing = await userRepo.findOne({ where: { email: data.email } });
    if (existing)
        throw new Error("Bu e-mail ile zaten bir kullanıcı mevcut.");
    const company = await companyRepo.findOneByOrFail({ id: data.createdByCompanyId });
    const code = (0, generateCode_1.generateUserCode)(company.code, data.name);
    const hashedPassword = await bcrypt_1.default.hash(data.password, 10);
    const newUser = userRepo.create({
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
        code,
        company: { id: company.id },
    });
    return await userRepo.save(newUser);
};
exports.registerUser = registerUser;
