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
import { QuantityItem } from "./QuantityItem";
import { User } from "./User";
import { ProjectQuantity } from "./ProjectQuantity";
import { Company } from "./Company";
import { CompanyFinanceTransaction } from "./CompanyFinance";

@Entity({ name: "projectsuppliers" })
@Index(
  "uq_supplier_category_unit_once",                    // index adı
  ["project", "category", "unit"],                          // sütunlar (entity alan adları)
  { unique: true, where: "addedfromquantityyn = 'Y'" }      // partial unique koşulu (DB sütun adıyla)
)
export class ProjectSupplier {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  code!: string;

  @ManyToOne(() => Company, { nullable: false })
  @JoinColumn({ name: "companyid" })
  company!: Company;

  @ManyToOne(() => CompanyProject)
  @JoinColumn({ name: "projectid" }) // camelCase → FK
  project!: CompanyProject;

  @ManyToOne(() => QuantityItem)
  @JoinColumn({ name: "quantityitemid" }) // camelCase → FK
  quantityItem?: QuantityItem | null;

  @ManyToOne(() => ProjectQuantity, { nullable: true })
  @JoinColumn({ name: "projectquantityid" })
  projectQuantity?: ProjectQuantity | null;

  @Column({ name: "addedfromquantityyn", type: "varchar", default: "N" })
  addedFromQuantityYN!: string;

  @Column({ name: "companyname", nullable: true }) // camelCase → fix
  companyName?: string;

  @Column()
  category!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column()
  unit!: string;

  @Column({ name: "unitprice", type: "numeric", nullable: true }) // camelCase → fix
  unitPrice?: number;

  @Column({ type: "numeric", nullable: true })
  quantity?: number;

  @Column({ name: "contractamount", type: "numeric", nullable: true }) // camelCase → fix
  contractAmount?: number;

  @Column({ name: "paidamount", type: "numeric", nullable: true, default: 0 }) // camelCase → fix
  paidAmount?: number;

  @Column({ name: "remainingamount", type: "numeric", nullable: true }) // camelCase → fix
  remainingAmount?: number | null;

  @Column({ default: "pending", nullable: true })
  status!: string;

  @CreateDateColumn({
    name: "createdatetime",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdatetime!: Date;

  @UpdateDateColumn({
    name: "updatedatetime",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  updatedatetime!: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: "createdby" }) // camelCase → fix
  createdBy!: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: "updatedby" }) // camelCase → fix
  updatedBy!: User;

  @OneToMany(
    () => CompanyFinanceTransaction,
    (financeTransaction) => financeTransaction.supplier
  )
  transactions!: CompanyFinanceTransaction[];
}
