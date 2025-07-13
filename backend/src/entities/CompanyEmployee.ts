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
import { Company } from "./Company";
import { User } from "./User";
import { CompanyProject } from "./CompanyProject";
import { CompanyEmployeeLeave } from "./CompanyEmployeeLeave";
import { CompanyEmployeeProject } from "./CompanyEmployeeProject";

@Entity({ name: "companyemployee" })
export class CompanyEmployee {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  code!: string;

  @Column({ name: "firstname" })
  firstName!: string;

  @Column({ name: "lastname" })
  lastName!: string;

  @Column({ type: "int", name: "age" })
  age!: number;

  @Column({ name: "startdate", type: "timestamp", nullable: true })
  startDate?: Date;

  @Column({ type: "numeric", name: "netsalary" })
  netSalary!: number;

  @Column({ type: "numeric", name: "grosssalary" })
  grossSalary!: number;

  @Column()
  position!: string;

  @Column()
  department!: string;

  // Leave rights
  @Column({ type: "numeric", default: 14, name: "paidleaveamount" })
  paidLeaveAmount!: number;

  @Column({ type: "numeric", default: 40, name: "unpaidleaveamount" })
  unpaidLeaveAmount!: number;

  @Column({ type: "numeric", default: 40, name: "sickleaveamount" })
  sickLeaveAmount!: number;

  @Column({ type: "numeric", default: 4, name: "roadleaveamount" })
  roadLeaveAmount!: number;

  @Column({ type: "numeric", default: 7, name: "excuseleaveamount" })
  excuseLeaveAmount!: number;

  @OneToMany(() => CompanyEmployeeLeave, (leave) => leave.employee)
  leaves!: CompanyEmployeeLeave[];

  @ManyToOne(() => Company)
  @JoinColumn({ name: "companyid" })
  company!: Company;

  @OneToMany(() => CompanyEmployeeProject, (project) => project.employee, { cascade: true })
  employeeProjects!: CompanyEmployeeProject[];

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
