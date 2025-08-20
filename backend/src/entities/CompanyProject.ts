import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  JoinColumn,
  Unique,
} from "typeorm";
import { User } from "./User";
import { Company } from "./Company";
import { ProjectEstimatedCost } from "./ProjectEstimatedCost";
import { ProjectSupplier } from "./ProjectSupplier";
import { ProjectSubcontractor } from "./ProjectSubcontractor";
import { ProjectQuantity } from "./ProjectQuantity";
import { ProjectCurrent } from "./ProjectCurrent";
import { CompanyFinanceTransaction } from "./CompanyFinance";
import { CompanyCheck } from "./CompanyCheck";
import { CompanyLoan } from "./CompanyLoan";
import { CompanyEmployeeProject } from "./CompanyEmployeeProject";

@Entity({ name: "companyprojects" })
@Unique("companyprojects_uq_company_code", ["company", "code"])
export class CompanyProject {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  code!: string;

  @Column()
  name!: string;

  @Column()
  site?: string;

  @Column({ default: "active" })
  status!: string;

  @Column({ type: "date", name: "estimatedstartdate", nullable: true })
  estimatedStartDate?: Date;

  @Column({ type: "date", name: "actualstartdate", nullable: true })
  actualStartDate?: Date;

  @Column({ type: "date", name: "estimatedenddate", nullable: true })
  estimatedEndDate?: Date;

  @Column({ type: "date", name: "actualenddate", nullable: true })
  actualEndDate?: Date;

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

  @ManyToOne(() => User)
  @JoinColumn({ name: "createdby" })
  createdBy!: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: "updatedby" })
  updatedBy!: User;

  @ManyToOne(() => Company, (company) => company.projects)
  @JoinColumn({ name: "companyid" })
  company!: Company;

  @OneToMany(
    () => ProjectEstimatedCost,
    (estimatedcost) => estimatedcost.project
  )
  estimatedCosts!: ProjectEstimatedCost[];

  @OneToMany(() => ProjectSupplier, (supplier) => supplier.project)
  suppliers!: ProjectSupplier[];

  @OneToMany(
    () => ProjectSubcontractor,
    (subcontractor) => subcontractor.project
  )
  subcontractors!: ProjectSubcontractor[];

  @OneToMany(() => ProjectQuantity, (quantity) => quantity.project)
  quantities!: ProjectQuantity[];

  @OneToMany(() => ProjectCurrent, (current) => current.project)
  currents!: ProjectCurrent[];

  @OneToMany(
    () => CompanyFinanceTransaction,
    (financeTransaction) => financeTransaction.project
  )
  financeTransactions!: CompanyFinanceTransaction[];

  @OneToMany(() => CompanyCheck, (check) => check.project)
  checks!: CompanyCheck;

  @OneToMany(() => CompanyLoan, (loan) => loan.project)
  loans!: CompanyLoan;

  @OneToMany(() => CompanyEmployeeProject, (employee) => employee.project, {
    cascade: true,
  })
  projectEmployees!: CompanyEmployeeProject[];
}
