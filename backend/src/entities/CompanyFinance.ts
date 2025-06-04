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
import { CompanyBalance } from "./CompanyBalance";
import { CompanyProject } from "./CompanyProject";
import { User } from "./User";
import { Company } from "./Company";
import { CompanyCheck } from "./CompanyCheck";

@Entity({ name: "companyfinancetransactions" })
export class CompanyFinanceTransaction {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  code!: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: "companyid" })
  company!: Company;

  @Column()
  type!: "PAYMENT" | "COLLECTION" | "TRANSFER";

  @Column({ type: "numeric" })
  amount!: number;

  @Column()
  currency!: string; // Örn: TRY, USD, EUR

  @ManyToOne(() => CompanyBalance)
  @JoinColumn({ name: "fromaccountid" })
  fromAccount!: CompanyBalance; // Akbank || Kasa || YKB

  @ManyToOne(() => CompanyBalance, { nullable: true })
  @JoinColumn({ name: "toaccountid" })
  toAccount?: CompanyBalance;

  @Column({ name: "targettype", nullable: true })
  targetType!: string; //"SUPPLIER" | "CUSTOMER" | "BANK" | "COMPANY" | "OTHER";

  @Column({ name: "source", nullable: true })
  source!: string;

  @Column({ name: "targetid", nullable: true })
  targetId?: string;

  @Column({ name: "targetname", nullable: true })
  targetName?: string;

  @Column({ name: "transactiondate", type: "timestamp", nullable: false })
  transactionDate!: Date;

  @Column({ name: "method" })
  method!: string; //"BANK" | "CASH" | "CHEQUE" | "CARD";

  @Column({ name: "category" })
  category!: string; // Check payment | Order Revenue

  @Column({ name: "invoiceyn", type: "varchar", default: "N" })
  invoiceYN!: string;

  @Column({ name: "invoicecode", nullable: true })
  invoiceCode?: string;

  @Column({ name: "checkcode", nullable: true })
  checkCode?: string;

  @Column({ name: "checkstatus", nullable: true })
  checkstatus?: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @ManyToOne(() => CompanyProject, { nullable: true })
  @JoinColumn({ name: "projectid" })
  project?: CompanyProject | null;

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
    () => CompanyCheck,
    (check) => check.checkNo
  )
  checks!: CompanyCheck[];
}
