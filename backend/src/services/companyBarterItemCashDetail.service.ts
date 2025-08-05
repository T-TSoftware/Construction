import { EntityManager } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { CompanyBarterAgreementItem } from "../entities/CompanyBarterAgreementItem";
import { CompanyBarterCashDetail } from "../entities/CompanyBarterItemCashDetail";
import {
  createBarterTransactionFromCashDetailData,
  deleteCompanyFinanceTransactionById,
  updateCompanyFinanceTransaction,
} from "./companyFinance.service";
import { CompanyBarterAgreement } from "../entities/CompanyBarterAgreement";

export const createCompanyBarterCashDetail = async (
  data: {
    barterItemId: string;
    amount: number;
    currency: string;
    fromAccountId: string;
    accountType: "CASH" | "BANK";
    status: "PENDING" | "PAID" | "COLLECTED";
    description?: string;
  },
  currentUser: { userId: string; companyId: string },
  manager: EntityManager = AppDataSource.manager
) => {
  const barterItemRepo = manager.getRepository(CompanyBarterAgreementItem);
  const barterAgreementRepo = manager.getRepository(CompanyBarterAgreement);
  const cashDetailRepo = manager.getRepository(CompanyBarterCashDetail);

  const barterItem = await barterItemRepo.findOneOrFail({
    where: {
      id: data.barterItemId,
      company: { id: currentUser.companyId },
    },
    relations: {
      barterAgreement: {
        project: true,
      },
    },
  });

  const newCashDetail = cashDetailRepo.create({
    company: { id: currentUser.companyId },
    barterItem,
    amount: data.amount,
    currency: data.currency,
    fromAccountId: data.fromAccountId,
    accountType: data.accountType,
    status: data.status,
    description: data.description,
    createdBy: { id: currentUser.userId },
    updatedBy: { id: currentUser.userId },
  });

  const savedCashDetail = await cashDetailRepo.save(newCashDetail);

  // 💸 Finansal işlem oluşturulması gereken durum
  if (data.status === "PAID" || data.status === "COLLECTED") {
    const transaction = await createBarterTransactionFromCashDetailData(
      {
        barterItemCode: `${barterItem.barterAgreement.project.code} - ${barterItem.barterAgreement.code}`,
        barterName: barterItem.description,
        amount: data.amount,
        currency: data.currency,
        transactionDate: savedCashDetail.updatedatetime ?? new Date(),
        fromAccountId: data.fromAccountId,
        direction: barterItem.direction,
        projectId: barterItem.barterAgreement.project.id,
        description: data.description,
      },
      currentUser,
      manager
    );

    // 💾 Oluşturulan finansal işlem bağlantısı güncellenebilir (opsiyonel)
    savedCashDetail.financeTransaction = transaction;
    await cashDetailRepo.save(savedCashDetail);
  }

  return savedCashDetail;
};

export const updateCompanyBarterCashDetail = async (
  id: string,
  data: {
    amount?: number;
    currency?: string;
    fromAccountId?: string;
    accountType?: "BANK" | "CASH";
    status?: "PENDING" | "PAID" | "COLLECTED";
    paymentDate?: Date;
    description?: string;
  },
  currentUser: { userId: string; companyId: string },
  manager: EntityManager = AppDataSource.manager
) => {
  const repo = manager.getRepository(CompanyBarterCashDetail);

  // 1. İlgili cash detail kaydı bulunur ve ilişkili tüm gerekli veriler çekilir
  const detail = await repo.findOneOrFail({
    where: { id },
    relations: [
      "barterItem",
      "barterItem.barterAgreement",
      "barterItem.barterAgreement.project",
      "financeTransaction",
      "company",
    ],
  });

  // 2. Kayıt kullanıcının şirketine ait değilse yetki hatası ver
  if (detail.company.id !== currentUser.companyId) {
    throw new Error("Bu kaydı güncelleme yetkiniz yok.");
  }

  // 3. Mevcut ve yeni status değerlerini belirle
  const oldStatus = detail.status;
  const newStatus = data.status ?? oldStatus;

  // 4. Mevcut ve yeni amount değerlerini belirle
  const oldAmount = detail.amount;
  const newAmount = data.amount ?? oldAmount;

  // 5. Değişiklik olup olmadığını kontrol et
  const amountChanged = data.amount !== undefined && data.amount !== oldAmount;
  const currencyChanged =
    data.currency !== undefined && data.currency !== detail.currency;
  const accountChanged =
    data.fromAccountId !== undefined &&
    data.fromAccountId !== detail.fromAccountId;
  const descriptionChanged =
    data.description !== undefined && data.description !== detail.description;
  const paymentDateChanged =
    data.paymentDate !== undefined &&
    data.paymentDate?.toISOString() !==
      detail.financeTransaction?.transactionDate?.toISOString();

  // 6. Transaction'ı güncellemek gerekiyor mu?
  const shouldUpdateTransaction =
    amountChanged ||
    currencyChanged ||
    accountChanged ||
    descriptionChanged ||
    paymentDateChanged;

  const barterItem = detail.barterItem;
  const barterAgreement = barterItem.barterAgreement;

  // 7. Eğer eski status PAID/COLLECTED ise ve yeni status PENDING ise → Transaction sil
  if (
    (oldStatus === "PAID" || oldStatus === "COLLECTED") &&
    newStatus !== "PAID" &&
    newStatus !== "COLLECTED"
  ) {
    if (detail.financeTransaction) {
      await repo.update({ id: detail.id }, { financeTransaction: null });

      await deleteCompanyFinanceTransactionById(
        detail.financeTransaction.id,
        currentUser,
        manager
      );
    }
    detail.financeTransaction = null; // ilişkisini de kaldır
  }

  // 8. Eğer eski status PENDING ve yeni status PAID/COLLECTED ise → Transaction oluştur
  if (
    (newStatus === "PAID" || newStatus === "COLLECTED") &&
    oldStatus !== "PAID" &&
    oldStatus !== "COLLECTED"
  ) {
    const transaction = await createBarterTransactionFromCashDetailData(
      {
        barterItemCode: `${barterAgreement.project?.code} - ${barterAgreement.code}`,
        barterName: barterItem.description,
        amount: newAmount,
        currency: data.currency ?? detail.currency,
        transactionDate: data.paymentDate ?? new Date(), // yoksa bugünün tarihi
        fromAccountId: data.fromAccountId ?? detail.fromAccountId,
        direction: barterItem.direction,
        projectId: barterAgreement.project?.id,
        description: data.description ?? detail.description,
      },
      currentUser,
      manager
    );

    detail.financeTransaction = transaction;
  }

  // 9. Eğer hem eski hem yeni status PAID/COLLECTED ise ve transaction varsa → Transaction güncelle
  if (
    (oldStatus === "PAID" || oldStatus === "COLLECTED") &&
    (newStatus === "PAID" || newStatus === "COLLECTED") &&
    detail.financeTransaction?.code &&
    shouldUpdateTransaction
  ) {
    await updateCompanyFinanceTransaction(
      detail.financeTransaction.code,
      {
        amount: newAmount,
        description: data.description ?? detail.description,
        transactionDate:
          data.paymentDate ?? detail.financeTransaction.transactionDate,
      },
      currentUser,
      manager
    );
  }

  // 10. Cash Detail güncellemesi yapılır
  await repo.update(
    { id },
    {
      ...(data.amount !== undefined && { amount: data.amount }),
      ...(data.currency !== undefined && { currency: data.currency }),
      ...(data.fromAccountId !== undefined && {
        fromAccountId: data.fromAccountId,
      }),
      ...(data.accountType !== undefined && { accountType: data.accountType }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.description !== undefined && { description: data.description }),
      ...(detail.financeTransaction && {
        financeTransaction: detail.financeTransaction,
      }),
      updatedBy: { id: currentUser.userId },
      updatedatetime: new Date(),
    }
  );
};

// services/companyBarterCashDetail.service.ts

export const getCompanyBarterCashDetailsByItemId = async (
  barterItemId: string,
  currentUser: { userId: string; companyId: string },
  manager: EntityManager = AppDataSource.manager
) => {
  const repo = manager.getRepository(CompanyBarterCashDetail);

  return await repo.find({
    where: {
      barterItem: { id: barterItemId },
      company: { id: currentUser.companyId },
    },
    order: { createdatetime: "ASC" },
    relations: {
      financeTransaction: true,
    },
  });
};
