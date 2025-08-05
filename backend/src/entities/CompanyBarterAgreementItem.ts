import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { CompanyBarterAgreement } from "./CompanyBarterAgreement";
import { CompanyStock } from "./CompanyStock";
import { ProjectSubcontractor } from "./ProjectSubcontractor";
import { ProjectSupplier } from "./ProjectSupplier";
import { Company } from "./Company";
import { User } from "./User";
import { CompanyBarterCashDetail } from "./CompanyBarterItemCashDetail";
import { CompanyFinanceTransaction } from "./CompanyFinance";

@Entity({ name: "companybarteragreementitems" })
export class CompanyBarterAgreementItem {
  @PrimaryGeneratedColumn("uuid")
  id!: string; // 🔑 Kalem ID’si

  @Column({ unique: true }) //
  code!: string; // 📄 Anlaşma kodu (örnek: BRT-2023-001)

  @ManyToOne(() => Company, { nullable: false })
  @JoinColumn({ name: "companyid" })
  company!: Company; // 🏢 Anlaşmanın ait olduğu şirket

  @ManyToOne(() => CompanyBarterAgreement, (agreement) => agreement.items)
  @JoinColumn({ name: "barteragreementid" })
  barterAgreement!: CompanyBarterAgreement; // 🔗 Ait olduğu anlaşma

  @Column()
  direction!: "OUT" | "IN";
  // 🔁 Kalemin yönü: Biz mi veriyoruz (GIVING), biz mi alıyoruz (RECEIVING)

  @Column({ name: "itemtype" })
  itemType!: "STOCK" | "SERVICE" | "ASSET" | "CASH" | "CHECK";
  // 📦 Kalem tipi:
  // STOCK → daire, malzeme
  // SERVICE → hizmet (taşeron/tedarik)
  // ASSET → araç, arsa
  // CASH → nakit
  // CHECK → çek

  @Column({ type: "text" })
  description!: string; // 🗒️ Açıklayıcı bilgi (örnek: "A blok 5. kat daire", "Ford Focus", "Beton işi")

  @Column({ name: "agreedvalue", type: "numeric" })
  agreedValue!: number; // 💰 Bu kalem için anlaşılan parasal değer

  @Column("numeric", { name: "processedamount", default: 0, nullable: true })
  processedAmount?: number;

  @Column("numeric", { name: "remainingamount", nullable: true })
  remainingAmount?: number | null;

  @Column({ default: "PENDING" }) // default: "PENDING"
  status!:
    | "PENDING"
    | "ACTIVE"
    | "COMPLETED"
    | "CANCELLED"
    | "PAID"
    | "COLLECTED"
    | "PARTIAL";

  @ManyToOne(() => CompanyStock, { nullable: true })
  @JoinColumn({ name: "relatedstockid" })
  relatedStock?: CompanyStock | null; // 🏘️ Stok (daire/malzeme vs.) referansı

  @ManyToOne(() => ProjectSubcontractor, { nullable: true })
  @JoinColumn({ name: "relatedsubcontractorid" })
  relatedSubcontractor?: ProjectSubcontractor | null; // 🔧 Hizmet taşeron referansı

  @ManyToOne(() => ProjectSupplier, { nullable: true })
  @JoinColumn({ name: "relatedsupplierid" })
  relatedSupplier?: ProjectSupplier | null; // 📦 Hizmet tedarikçi referansı

  @Column({ type: "jsonb", nullable: true, name: "assetdetails" })
  assetDetails?: Record<string, any>; // 🚘 Fiziksel varlık detayları (araç, arsa vs.)

  @OneToMany(
    () => CompanyBarterCashDetail,
    (cashDetail) => cashDetail.barterItem
  )
  cashDetails?: CompanyBarterCashDetail[];

  @ManyToOne(() => User)
  @JoinColumn({ name: "createdby" })
  createdBy!: User; // ✍️ Oluşturan kullanıcı

  @ManyToOne(() => User)
  @JoinColumn({ name: "updatedby" })
  updatedBy!: User; // 🛠️ Güncelleyen kullanıcı

  @CreateDateColumn({
    type: "timestamp",
    name: "createdatetime",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdatetime!: Date;

  @UpdateDateColumn({
    type: "timestamp",
    name: "updatedatetime",
    default: () => "CURRENT_TIMESTAMP",
  })
  updatedatetime!: Date;

  @OneToMany(
    () => CompanyFinanceTransaction,
    (financeTransaction) => financeTransaction.barterItem
  )
  transactions!: CompanyFinanceTransaction[];
}
