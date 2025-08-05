import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { CompanyBarterAgreementItem } from "./CompanyBarterAgreementItem";

import { User } from "./User";
import { Company } from "./Company";
import { CompanyFinanceTransaction } from "./CompanyFinance";

@Entity("companybartercashdetails")
export class CompanyBarterCashDetail {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Company, { nullable: false })
  @JoinColumn({ name: "companyid" })
  company!: Company; // 🏢 Anlaşmanın ait olduğu şirket

  @ManyToOne(() => CompanyBarterAgreementItem, (item) => item.cashDetails)
  @JoinColumn({ name: "barteritemid" })
  barterItem!: CompanyBarterAgreementItem;

  @Column({
    type: "enum",
    enum: ["PENDING", "PAID", "COLLECTED"],
    default: "PENDING",
  })
  status!: "PENDING" | "PAID" | "COLLECTED";

  @ManyToOne(() => CompanyFinanceTransaction, { nullable: true })
  @JoinColumn({ name: "financetransactionid" })
  financeTransaction?: CompanyFinanceTransaction | null;

  @Column({ type: "numeric" })
  amount!: number;

  @Column()
  currency!: string; // Örn: TRY, USD, EUR

  @Column("uuid", { name: "fromaccountid" })
  fromAccountId!: string;

  @Column({ type: "enum", enum: ["CASH", "BANK"], name: "accounttype" })
  accountType!: "CASH" | "BANK";

  @Column({ type: "text", nullable: true })
  description?: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "createdby" })
  createdBy!: User;

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
