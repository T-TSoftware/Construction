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
import { CompanyFinanceTransaction } from "./CompanyFinance";
import { CompanyStock } from "./CompanyStock";
import { User } from "./User";

@Entity({ name: "companyorders" })
export class CompanyOrder {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  code!: string; // sipariş kodu (ör: SAT001)

  @ManyToOne(() => Company)
  @JoinColumn({ name: "companyid" })
  company!: Company;

  @ManyToOne(() => CompanyProject)
  @JoinColumn({ name: "projectid" })
  project?: CompanyProject | null;

  @ManyToOne(() => CompanyStock)
  @JoinColumn({ name: "stockid" })
  stock?: CompanyProject;

  @Column()
  customerName!: string;

  @Column({ name: "stocktype" })
  stockType?: string; // örnek: "3+1", "Villa", "Dublex", "1+1"

  @Column({ nullable: true })
  description?: string;

  @Column("numeric", { name: "totalamount" })
  totalAmount!: number;

  @Column("numeric", { name: "receivedamount", default: 0 })
  receivedAmount!: number;

  @Column("numeric", { name: "remainingamount", default: 0 })
  remainingAmount!: number;

  @Column({ default: "UNCOLLECTED" })
  status!: "COLLECTED" | "PARTIAL" | "UNCOLLECTED" | "CANCELLED";

  @ManyToOne(() => User)
  @JoinColumn({ name: "createdby" })
  createdBy!: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: "updatedby" }) // camelCase → fix
  updatedBy!: User;

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
    (financeTransaction) => financeTransaction.order
  )
  transactions!: CompanyFinanceTransaction[];
}
