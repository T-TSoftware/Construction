import { AppDataSource } from "../config/data-source";
import { CompanyOrder } from "../entities/CompanyOrder";
import { CompanyStock } from "../entities/CompanyStock";
import { CompanyProject } from "../entities/CompanyProject";
import { EntityManager } from "typeorm";
import {
  generateEntityCode,
  generateNextOrderCode,
} from "../utils/generateCode";
import { decreaseStockQuantity } from "./companyStock.service";
import { User } from "../entities/User";
import { saveRefetchSanitize } from "../utils/persist";
import { sanitizeRules } from "../utils/sanitizeRules";
import { sanitizeEntity } from "../utils/sanitize";

export const createCompanyOrder = async (
  data: {
    stockId: string;
    projectId?: string;
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
      id: data.stockId,
      company: { id: currentUser.companyId },
    },
  });

  // 2. Project opsiyonel
  let project = null;
  if (data.projectId) {
    project = await projectRepo.findOneOrFail({
      where: {
        id: data.projectId,
        company: { id: currentUser.companyId },
      },
    });
  }

  // 3. Kod üretimi
  /*const code = await generateNextOrderCode({
    companyId: currentUser.companyId,
    reference: project?.name ?? stock.category,
    manager,
  });*/
  const code = await generateEntityCode(
    manager,
    currentUser.companyId,
    "CompanyOrder"
  );

  // 4. Order oluştur
  const order = orderRepo.create({
    code,
    customerName: data.customerName,
    totalAmount: data.totalAmount,
    receivedAmount: 0,
    remainingAmount: data.totalAmount,
    status: "UNCOLLECTED",
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

  /*const savedOrder = await orderRepo.save(order);
  const fullOrder = await orderRepo.findOneOrFail({
    where: { id: savedOrder.id, company: { id: currentUser.companyId } },
    relations: ["project", "stock", "createdBy", "updatedBy"],
  });

  return fullOrder;*/
  return await saveRefetchSanitize({
    entityName: "CompanyOrder",
    save: () => orderRepo.save(order),
    refetch: () =>
      orderRepo.findOneOrFail({
        where: { id: order.id, company: { id: currentUser.companyId } },
        relations: ["project", "company", "stock", "createdBy", "updatedBy"],
      }),
    rules: sanitizeRules,
    defaultError: "Satıs kaydı oluşturulamadı.",
  });
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
  order.status = order.remainingAmount <= 0 ? "COLLECTED" : "PARTIAL";
  //order.updatedatetime = new Date();
  order.updatedBy = { id: currentUser.userId } as User;
  console.log("BEFORE", order.receivedAmount, "ADDING", amountReceived);

  return await orderRepo.save(order);
};

export const getCompanyOrders = async (
  currentUser: { userId: string; companyId: string },
  manager: EntityManager = AppDataSource.manager
) => {
  const repo = manager.getRepository(CompanyOrder);

  const orders = await repo.find({
    where: {
      company: { id: currentUser.companyId },
    },
    relations: ["stock", "project", "createdBy", "updatedBy", "company"],
    //order: { transactionDate: "DESC" },
  });

  return sanitizeEntity(orders, "CompanyOrder", sanitizeRules);
};

export const getCompanyOrderById = async (
  id: string,
  currentUser: { userId: string; companyId: string },
  manager: EntityManager = AppDataSource.manager
) => {
  const repo = manager.getRepository(CompanyOrder);

  const order = await repo.findOne({
    where: {
      id,
      company: { id: currentUser.companyId },
    },
    relations: ["stock", "project", "createdBy", "updatedBy", "company"],
  });

  if (!order) {
    throw new Error("İlgili satış bulunamadı.");
  }

  return sanitizeEntity(order, "CompanyOrder", sanitizeRules);
};

export const getCompanyOrdersByProjectId = async (
  projectId: string,
  currentUser: { userId: string; companyId: string },
  manager: EntityManager = AppDataSource.manager
) => {
  const repo = manager.getRepository(CompanyOrder);

  const order = await repo.find({
    where: {
      project: { id: projectId, company: { id: currentUser.companyId } },
      company: { id: currentUser.companyId },
    },
    relations: ["stock", "project", "createdBy", "updatedBy", "company"],
  });

  if (!order) {
    throw new Error("İlgili satış bulunamadı.");
  }

  return sanitizeEntity(order, "CompanyOrder", sanitizeRules);
};

export const updateOrderPaymentStatusNew = async (
  orderCode: string,
  amount: number,
  currentUser: { userId: string; companyId: string },
  manager: EntityManager,
  isReverse = false
) => {
  const orderRepo = manager.getRepository(CompanyOrder);

  const order = await orderRepo.findOneOrFail({
    where: {
      code: orderCode,
      company: { id: currentUser.companyId },
    },
  });

  const factor = isReverse ? -1 : 1;

  // ✅ receivedAmount güncelle (increment/decrement)
  await orderRepo.increment(
    { id: order.id },
    "receivedAmount",
    factor * amount
  );

  // Güncellenmiş order'ı tekrar çek
  const updatedOrder = await orderRepo.findOneOrFail({
    where: { id: order.id },
  });

  // ✅ remainingAmount ve status hesapla
  const remainingAmount =
    Number(updatedOrder.totalAmount) - Number(updatedOrder.receivedAmount);
  const status = remainingAmount <= 0 ? "COLLECTED" : "PARTIAL";

  updatedOrder.remainingAmount = remainingAmount;
  updatedOrder.status = status;
  updatedOrder.updatedBy = { id: currentUser.userId } as User;
  updatedOrder.updatedatetime = new Date();

  // Kaydet
  return await orderRepo.save(updatedOrder);
};
