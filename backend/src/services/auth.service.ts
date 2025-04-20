import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";
import { generateToken } from "../utils/jwt";
import { Company } from "../entities/Company";
import { generateUserCode } from "../utils/generateCode";


const userRepo = AppDataSource.getRepository(User);
const companyRepo = AppDataSource.getRepository(Company)

export const loginUser = async (
  email: string,
  password: string
): Promise<string> => {
  const user = await userRepo.findOne({
    where: { email },
    relations: ["company"],
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error("Invalid email or password");
  }

  const token = generateToken({
    userId: user.id,
    companyId: user.company.id,
    role: user.role,
  });

  return token;
};

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

export const registerUser = async (data: {
  name: string;
  email: string;
  password: string;
  role: string;
  createdByCompanyId: string;
}) => {
  const existing = await userRepo.findOne({ where: { email: data.email } });
  if (existing) throw new Error("Bu e-mail ile zaten bir kullanıcı mevcut.");

  const company = await companyRepo.findOneByOrFail({ id: data.createdByCompanyId });

  const code = generateUserCode(company.code, data.name);
  const hashedPassword = await bcrypt.hash(data.password, 10);

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