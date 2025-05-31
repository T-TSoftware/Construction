import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { CompanyBalance } from "./CompanyBalance";
import { CompanyProject } from "./CompanyProject";
import { CompanyStock } from "./CompanyStock";
import { CompanyFinanceTransaction } from "./CompanyFinance";
import { CompanyCheck } from "./CompanyCheck";

@Entity({ name: "company" })
export class Company {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column()
  code!: string;

  @Column({ name: "taxnumber", nullable: true })
  taxNumber?: string;

  @Column({ nullable: true })
  address?: string;

  @CreateDateColumn({
    type: "timestamp",
    name: "createdatetime",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdatetime?: Date;

  @UpdateDateColumn({
    type: "timestamp",
    name: "updatedatetime",
    default: () => "CURRENT_TIMESTAMP",
  })
  updatedatetime?: Date;

  @OneToMany(() => CompanyBalance, (balance) => balance.company)
  balances!: CompanyBalance[];

  @OneToMany(() => CompanyProject, (project) => project.company)
  projects!: CompanyProject[];

  @OneToMany(() => CompanyStock, (stock) => stock.company)
  stocks!: CompanyStock[];

  @OneToMany(
    () => CompanyFinanceTransaction,
    (financeTransaction) => financeTransaction.company
  )
  financeTransactions!: CompanyFinanceTransaction[];

  @OneToMany(() => CompanyCheck, (check) => check.company)
  checks!: CompanyCheck;
}
