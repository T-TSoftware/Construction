import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { CompanyLoan } from "./CompanyLoan";
import { CompanyFinanceTransaction } from "./CompanyFinance";
import { User } from "./User";
import { Company } from "./Company";

@Entity({ name: "companyloanpayment" })
export class CompanyLoanPayment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => CompanyLoan, (loan) => loan.payments)
  @JoinColumn({ name: "loanid" })
  loan!: CompanyLoan;

  @ManyToOne(() => Company, { nullable: false })
  @JoinColumn({ name: "companyid" })
  company!: Company;

  @Column({ name: "code", type: "varchar", length: 100, unique: true })
  code!: string; // e.g., HALKKGFFATURA1-TAKSİT:1

  @Column({ name: "installmentnumber", type: "int" })
  installmentNumber!: number; // Taksit numarası

  @Column({ name: "duedate", type: "date" })
  dueDate!: Date; // Vade tarihi

  @Column({ name: "totalamount", type: "numeric" })
  totalAmount!: number; // Borç tutarı (anapara + faiz)

  @Column({ name: "interestamount", type: "numeric" })
  interestAmount!: number; // Faiz + vergi + fon

  @Column({ name: "principalamount", type: "numeric" })
  principalAmount!: number; // Anapara

  @Column({ name: "paymentamount", type: "numeric", nullable: true })
  paymentAmount?: number;

  @Column("numeric", { name: "remainingamount" })
  remainingAmount!: number;

  @Column({ name: "status", type: "varchar", length: 20, default: "PENDING" })
  status!: "PENDING" | "PAID" | "OVERDUE";

  @Column({ name: "paymentdate", type: "date", nullable: true })
  paymentDate?: Date;

  @Column({
    name: "penaltyamount",
    type: "numeric",
    nullable: true,
    default: 0,
  })
  penaltyAmount!: number;

  @OneToMany(
    () => CompanyFinanceTransaction,
    (financeTransaction) => financeTransaction.loanPayment
  )
  transactions!: CompanyFinanceTransaction[];

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
