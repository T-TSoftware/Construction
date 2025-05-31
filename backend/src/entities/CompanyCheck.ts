import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { CompanyProject } from "./CompanyProject";
import { CompanyFinanceTransaction } from "./CompanyFinance";
import { Company } from "./Company";
import { User } from "./User";
import { CompanyBalance } from "./CompanyBalance";

@Entity("companychecks", { schema: "artikonsept" })
export class CompanyCheck {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  code!: string;

  @Column({ name: "checkdate", type: "date" })
  checkDate!: Date;

  @Column({ name: "transactiondate", type: "timestamp" })
  transactionDate!: Date;

  @Column()
  firm!: string;

  @Column({ type: "numeric" })
  amount!: number;

  @Column({ name: "checknumber", unique: true })
  checkNo!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  status?: string;

  @ManyToOne(() => CompanyBalance)
  @JoinColumn({ name: "bankid" })
  bank!: CompanyBalance;

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
