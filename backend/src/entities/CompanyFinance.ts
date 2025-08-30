import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from "typeorm";
import { CompanyBalance } from "./CompanyBalance";
import { CompanyProject } from "./CompanyProject";
import { User } from "./User";
import { Company } from "./Company";
import { CompanyCheck } from "./CompanyCheck";
import { CompanyOrder } from "./CompanyOrder";
import { CompanyLoanPayment } from "./CompanyLoanPayment";
import { ProjectSubcontractor } from "./ProjectSubcontractor";
import { ProjectSupplier } from "./ProjectSupplier";
import { CompanyBarterAgreementItem } from "./CompanyBarterAgreementItem";

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
  currency!: string;

  @ManyToOne(() => CompanyBalance)
  @JoinColumn({ name: "fromaccountid" })
  fromAccount!: CompanyBalance;

  @ManyToOne(() => CompanyBalance, { nullable: true })
  @JoinColumn({ name: "toaccountid" })
  toAccount?: CompanyBalance;

  @Column({ name: "targettype", nullable: true })
  targetType!: string;

  @Column({ name: "targetid", nullable: true })
  targetId?: string;

  @Column({ name: "targetname", nullable: true })
  targetName?: string;

  @Column({ name: "transactiondate", type: "timestamp", nullable: false })
  transactionDate!: Date;

  @Column()
  method!: string;

  @Column()
  category!: string;

  @Column({ name: "invoiceyn", type: "varchar", default: "N" })
  invoiceYN!: string;

  @Column({ name: "invoicecode", nullable: true })
  invoiceCode?: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ name: "source", nullable: true })
  source!: string;

  @Column({ name: "referencecode", nullable: true })
  referenceCode?: string; // Hangi entity olursa olsun code’u burada tutulur

  @ManyToOne(() => CompanyProject, { nullable: true })
  @JoinColumn({ name: "projectid" })
  project?: CompanyProject | null;

  @ManyToOne(() => CompanyCheck, { nullable: true })
  @JoinColumn({ name: "checkid" })
  check?: CompanyCheck | null;

  @ManyToOne(() => CompanyOrder, { nullable: true })
  @JoinColumn({ name: "orderid" })
  order?: CompanyOrder | null;

  @ManyToOne(() => CompanyLoanPayment, { nullable: true })
  @JoinColumn({ name: "loanpaymentid" })
  loanPayment?: CompanyLoanPayment | null;

  @ManyToOne(() => ProjectSubcontractor, { nullable: true })
  @JoinColumn({ name: "subcontractorid" })
  subcontractor?: ProjectSubcontractor | null;

  @ManyToOne(() => ProjectSupplier, { nullable: true })
  @JoinColumn({ name: "supplierid" })
  supplier?: ProjectSupplier | null;

  @ManyToOne(() => CompanyBarterAgreementItem, { nullable: true })
  @JoinColumn({ name: "barteritemid" })
  barterItem?: CompanyBarterAgreementItem | null;

  @Column({ nullable: true, name: "transfergroupid" })
  transferGroupId?: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "createdby" })
  createdBy!: User;

  @ManyToOne(() => User)
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
