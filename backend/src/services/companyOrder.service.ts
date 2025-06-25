import { AppDataSource } from "../config/data-source";
import { CompanyOrder } from "../entities/CompanyOrder";
import { CompanyStock } from "../entities/CompanyStock";
import { CompanyProject } from "../entities/CompanyProject";
import { EntityManager } from "typeorm";
import { generateNextOrderCode } from "../utils/generateCode";
import { decreaseStockQuantity } from "./companyStock.service";

export const createCompanyOrder = async (
  data: {
    stockCode: string;
    projectCode?: string;
    customerName: string;
    totalAmount: number;
    description?: string;
    stockType: string;
  },
  currentUser: { userId: string; companyId: string },
  manager: EntityManager = AppDataSource.manager
) => {
  const stockRepo = manager.getRepository(CompanyStock);
  const projectRepo = manager.getRepository(CompanyProject);
  const orderRepo = manager.getRepository(CompanyOrder);

  // 1. Stock'u bul
  const stock = await stockRepo.findOneOrFail({
    where: {
      code: data.stockCode,
      company: { id: currentUser.companyId },
    },
  });

  // 2. Project opsiyonel
  let project = null;
  if (data.projectCode) {
    project = await projectRepo.findOneOrFail({
      where: {
        code: data.projectCode,
        company: { id: currentUser.companyId },
      },
    });
  }

  // 3. Kod üretimi
  const code = await generateNextOrderCode({
    companyId: currentUser.companyId,
    reference: project?.name ?? stock.category,
    manager,
  });

  // 4. Order oluştur
  const order = orderRepo.create({
    code,
    customerName: data.customerName,
    totalAmount: data.totalAmount,
    receivedAmount: 0,
    remainingAmount: data.totalAmount,
    status: "UNPAID",
    description: data.description,
    stockType: data.stockType,
    company: { id: currentUser.companyId },
    project: project ? { id: project.id } : null,
    stock: { id: stock.id },
    createdBy: { id: currentUser.userId },
    updatedBy: { id: currentUser.userId },
  });
  await decreaseStockQuantity(
    {
      stockId: stock.id,
      quantity: 1, // şu an için sabit 1 olarak kabul ettik
    },
    manager
  );

  return await orderRepo.save(order);
};

export const updateOrderPaymentStatus = async (
  orderCode: string,
  amountReceived: number,
  currentUser: { userId: string; companyId: string },
  manager: EntityManager
) => {
  const orderRepo = manager.getRepository(CompanyOrder);

  const order = await orderRepo.findOneOrFail({
    where: {
      code: orderCode,
      company: { id: currentUser.companyId },
    },
  });

  order.receivedAmount = Number(order.receivedAmount) + amountReceived;
  order.remainingAmount = Number(order.totalAmount) - order.receivedAmount;
  order.status = order.remainingAmount <= 0 ? "PAID" : "PARTIAL";
  order.updatedatetime = new Date();
  order.updatedBy = { id: currentUser.userId } as any;
  console.log("BEFORE", order.receivedAmount, "ADDING", amountReceived);

  return await orderRepo.save(order);
};
