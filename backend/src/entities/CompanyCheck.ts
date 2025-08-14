import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from "typeorm";
import { CompanyProject } from "./CompanyProject";
import { CompanyFinanceTransaction } from "./CompanyFinance";
import { Company } from "./Company";
import { User } from "./User";
import { CompanyBalance } from "./CompanyBalance";

@Entity("companychecks", { schema: "artikonsept" })
@Unique("uq_company_checknumber", ["company", "checkNo"])
export class CompanyCheck {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  code!: string;

  @Column({ name: "checkdate", type: "date" })
  checkDate!: Date;

  @Column({ name: "transactiondate", type: "timestamp", nullable: true })
  transactionDate?: Date;

  @Column({ name: "duedate", type: "date" })
  dueDate!: Date; // Vade tarihi

  @Column()
  firm!: string;

  @Column({ type: "numeric" })
  amount!: number;

  @Column({ name: "checknumber"})
  checkNo!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  status?: string;

  @Column({ type: "varchar", nullable: false })
  type!: "PAYMENT" | "COLLECTION";

  @ManyToOne(() => CompanyBalance)
  @JoinColumn({ name: "bankid" })
  bank!: CompanyBalance;

  @Column("numeric", { name: "processedamount", default: 0, nullable: true })
  processedAmount?: number;

  @Column({
    name: "remainingamount",
    type: "numeric",
  })
  remainingAmount?: number;

  @ManyToOne(() => CompanyFinanceTransaction, { nullable: true })
  @JoinColumn({ name: "transactionid" })
  transaction?: CompanyFinanceTransaction | null;

  // 🔗 Proje ile ilişki
  @ManyToOne(() => CompanyProject, { nullable: true })
  @JoinColumn({ name: "projectid" })
  project?: CompanyProject | null;

  // 🔗 Şirket ilişkisi
  @ManyToOne(() => Company, { nullable: false })
  @JoinColumn({ name: "companyid" })
  company!: Company;

  // 🔗 Oluşturan kullanıcı
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: "createdby" })
  createdBy!: User;

  // 🔗 Güncelleyen kullanıcı
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: "updatedby" })
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
}
