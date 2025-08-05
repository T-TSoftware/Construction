// services/barter/processBarterItem.ts
import { EntityManager } from "typeorm";
import { CompanyBarterAgreementItem } from "../entities/CompanyBarterAgreementItem";
import { CompanyStock } from "../entities/CompanyStock";
import { ProjectSubcontractor } from "../entities/ProjectSubcontractor";
import { ProjectSupplier } from "../entities/ProjectSupplier";
import { CompanyFinanceTransaction } from "../entities/CompanyFinance";

type Props = {
  item: CompanyBarterAgreementItem;
  agreementCode: string;
  currentUser: { userId: string; companyId: string };
  manager: EntityManager;
};

export const processBarterItem = async ({
  item,
  agreementCode,
  currentUser,
  manager,
}: Props) => {
  const stockRepo = manager.getRepository(CompanyStock);
  const subcontractorRepo = manager.getRepository(ProjectSubcontractor);
  const supplierRepo = manager.getRepository(ProjectSupplier);
  const transactionRepo = manager.getRepository(CompanyFinanceTransaction);

  // Hizmet -> Ödeme
  if (item.itemType === "SERVICE" && item.direction === "IN") {
    if (item.relatedSubcontractor?.id) {
      await subcontractorRepo.increment(
        { id: item.relatedSubcontractor.id },
        "paidAmount",
        item.agreedValue
      );
    }
    if (item.relatedSupplier?.id) {
      await supplierRepo.increment(
        { id: item.relatedSupplier.id },
        "paidAmount",
        item.agreedValue
      );
    }
  }

  // Stok işlemleri
  if (item.itemType === "STOCK" && item.relatedStock?.id) {
    const quantityChange = 1;

    if (item.direction === "OUT") {
      console.log("Enter 1 ");
      await stockRepo.decrement(
        { id: item.relatedStock.id },
        "quantity",
        quantityChange
      );
    }

    if (item.direction === "IN") {
      await stockRepo.increment(
        { id: item.relatedStock.id },
        "quantity",
        quantityChange
      );
    }
  }
};
