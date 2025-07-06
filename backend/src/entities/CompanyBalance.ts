import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { Company } from "./Company";
import { CompanyFinanceTransaction } from "./CompanyFinance";
import { CompanyCheck } from "./CompanyCheck";
import { CompanyLoan } from "./CompanyLoan";

@Entity({ name: "companybalances" })
export class CompanyBalance {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  code!: string;

  @ManyToOne(() => Company, (company) => company.balances, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "companyid" })
  company!: Company;

  @Column()
  name!: string;

  @Column("numeric", { precision: 15, scale: 2 })
  amount!: number;

  @Column()
  currency!: string;

  @Column({ name: "createdby" })
  createdBy!: string;

  @Column({ name: "updatedby" })
  updatedBy!: string;

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
    (financeTransaction) => financeTransaction.fromAccount
  )
  outgoingFinanceTransactions!: CompanyFinanceTransaction[];

  @OneToMany(
    () => CompanyFinanceTransaction,
    (financeTransaction) => financeTransaction.toAccount
  )
  incomingFinanceTransactions!: CompanyFinanceTransaction[];

  @OneToMany(() => CompanyCheck, (check) => check.bank)
  checks!: CompanyCheck;

  @OneToMany(() => CompanyLoan, (loan) => loan.bank)
  loans!: CompanyLoan;
}
