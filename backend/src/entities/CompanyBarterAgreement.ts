import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Company } from "./Company";
import { CompanyProject } from "./CompanyProject";
import { User } from "./User";
import { CompanyBarterAgreementItem } from "./CompanyBarterAgreementItem";

@Entity({ name: "companybarteragreements" })
export class CompanyBarterAgreement {
  @PrimaryGeneratedColumn("uuid")
  id!: string; // 🔑 Anlaşma ID’si (otomatik oluşturulan)

  @Column({ unique: true })
  code!: string; // 📄 Anlaşma kodu (örnek: BRT-2023-001)

  @ManyToOne(() => Company, { nullable: false })
  @JoinColumn({ name: "companyid" })
  company!: Company; // 🏢 Anlaşmanın ait olduğu şirket

  @ManyToOne(() => CompanyProject)
  @JoinColumn({ name: "projectid" })
  project!: CompanyProject; // 🏗️ Anlaşmanın ait olduğu proje

  @Column({ name: "counterpartytype" })
  counterpartyType!: "SUPPLIER" | "SUBCONTRACTOR" | "CUSTOMER" | "EXTERNAL";
  // 🤝 Karşı tarafın tipi (tedarikçi, taşeron, müşteri, dış kaynak)

  @Column({ name: "counterpartyid", type: "uuid", nullable: true })
  counterpartyId?: string | null; // 🆔 Karşı tarafın ID’si (ProjectSupplier, ProjectSubcontractor vb.)

  @Column({ name: "counterpartyname" })
  counterpartyName!: string; // 🧾 Karşı tarafın adı (kolay erişim için)

  @Column({ name: "agreementdate", type: "timestamp", nullable: false })
  agreementDate!: Date; // 📅 Anlaşmanın yapıldığı tarih

  @Column({ default: "DRAFT" })
  status!: "DRAFT" | "PROPOSED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  // 📌 Anlaşmanın durumu

  @Column({ type: "text", nullable: true })
  description?: string; // 🗒️ Anlaşmaya dair açıklama/not

  @Column({ name: "totalourvalue", type: "numeric", nullable: true })
  totalOurValue?: number; // 💸 Bizim verdiğimiz toplam değerin parasal karşılığı

  @Column({ name: "totaltheirvalue", type: "numeric", nullable: true })
  totalTheirValue?: number; // 💵 Karşı tarafın verdiği toplam değerin parasal karşılığı

  @OneToMany(() => CompanyBarterAgreementItem, (item) => item.barterAgreement)
  items!: CompanyBarterAgreementItem[]; // 🔗 Anlaşmaya bağlı kalemler

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
}
