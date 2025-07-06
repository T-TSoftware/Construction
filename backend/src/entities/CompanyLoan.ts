import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { User } from "./User";
import { Company } from "./Company";
import { CompanyLoanPayment } from "./CompanyLoanPayment";
import { CompanyBalance } from "./CompanyBalance";
import { CompanyProject } from "./CompanyProject";

@Entity({ name: "companyloan" })
export class CompanyLoan {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Company, { nullable: false })
  @JoinColumn({ name: "companyid" })
  company!: Company;

  @Column({ name: "code", type: "varchar", length: 100, unique: true })
  code!: string; // e.g., KRD-ZIRAAT-2025-001

  @Column({ name: "name", type: "varchar", length: 100, unique: true })
  name!: string; // e.g., KRD-ZIRAAT-2025-001

  @Column({ name: "accountno", type: "varchar" })
  accountNo!: string;

  @ManyToOne(() => CompanyBalance, { nullable: false })
  @JoinColumn({ name: "bankid" })
  bank!: CompanyBalance;

  @ManyToOne(() => CompanyProject, { nullable: true })
  @JoinColumn({ name: "projectid" })
  project?: CompanyProject | null;

  @Column({ name: "totalloanamount", type: "numeric", precision: 15, scale: 2 })
  totalAmount!: number; // kredi tutarı ana para !!!

  @Column({ name: "remainingprincipal", type: "numeric" })
  remainingPrincipal!: number; // Kalan anapara borç bakiyesi !!!

  @Column({ name: "remaininginstallmentamount", type: "numeric", precision: 15, scale: 2 })
  remainingInstallmentAmount!: number; // toplam taksit borcu !!! 

  @Column({ name: "currency", type: "varchar", length: 3, default: "TRY" })
  currency!: string;

  @Column({ name: "interestrate", type: "numeric", precision: 5, scale: 2 })
  interestRate!: number; // e.g., 2.5 (%)

  @Column({ name: "totalinstallmentcount", type: "int" })
  totalInstallmentCount!: number;

  @Column({ name: "remaininginstallmentcount", type: "int" })
  remainingInstallmentCount!: number;

  @Column({ name: "loandate", type: "date" })
  loanDate!: Date;

  @Column({ name: "purpose", type: "varchar", length: 100, nullable: true })
  purpose?: string;

  @Column({ name: "loantype", type: "varchar", length: 50, nullable: true })
  loanType?: string; // örnek: "İşletme", "Yatırım", "Spot", "İpotekli"

  @Column({
    name: "status",
    type: "varchar",
    length: 20,
    default: "ACTIVE",
  })
  status!: "ACTIVE" | "CLOSED" | "CANCELED";

  @Column({ name: "description", type: "text", nullable: true })
  description?: string;

  @OneToMany(() => CompanyLoanPayment, (payment) => payment.loan)
  payments!: CompanyLoanPayment[];

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
}
