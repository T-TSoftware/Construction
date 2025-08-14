import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToMany,
  Index,
} from "typeorm";
import { CompanyProject } from "./CompanyProject";
import { ProjectQuantity } from "./ProjectQuantity";
import { QuantityItem } from "../entities/QuantityItem";
import { User } from "./User";
import { Company } from "./Company";
import { CompanyFinanceTransaction } from "./CompanyFinance";

@Entity({ name: "projectsubcontractors" })
@Index(
  "uq_subcontractor_category_unit_once",                    // index adı
  ["project", "category", "unit"],                          // sütunlar (entity alan adları)
  { unique: true, where: "addedfromquantityyn = 'Y'" }      // partial unique koşulu (DB sütun adıyla)
)
export class ProjectSubcontractor {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  code!: string;

  @ManyToOne(() => Company, { nullable: false })
  @JoinColumn({ name: "companyid" })
  company!: Company;

  @ManyToOne(() => CompanyProject)
  @JoinColumn({ name: "projectid" })
  project!: CompanyProject;

  @ManyToOne(() => ProjectQuantity, { nullable: true })
  @JoinColumn({ name: "projectquantityid" })
  projectQuantity?: ProjectQuantity;

  @ManyToOne(() => QuantityItem)
  @JoinColumn({ name: "quantityitemid" }) // camelCase → FK
  quantityItem?: QuantityItem | null;

  @Column({ name: "addedfromquantityyn", type: "varchar", default: "N" })
  addedFromQuantityYN!: string;

  @Column({ default: false })
  locked!: boolean;

  @Column({ name: "companyname", nullable: true })
  companyName?: string;

  @Column()
  category!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column()
  unit!: string;

  @Column({ name: "unitprice", type: "numeric", nullable: true })
  unitPrice?: number;

  @Column({ type: "numeric", nullable: true })
  quantity?: number;

  @Column({ name: "contractamount", type: "numeric", nullable: true })
  contractAmount?: number;

  @Column({ name: "paidamount", type: "numeric", nullable: true, default: 0, })
  paidAmount?: number;

  @Column({ name: "remainingamount", type: "numeric", nullable: true })
  remainingAmount?: number | null;

  @Column({ default: "pending", nullable: true })
  status!: string;

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

  @ManyToOne(() => User)
  @JoinColumn({ name: "createdby" })
  createdBy!: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: "updatedby" })
  updatedBy!: User;

  @OneToMany(
    () => CompanyFinanceTransaction,
    (financeTransaction) => financeTransaction.subcontractor
  )
  transactions!: CompanyFinanceTransaction[];
}
