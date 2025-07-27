// CompanyEmployeeProject.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { CompanyEmployee } from "./CompanyEmployee";
import { CompanyProject } from "./CompanyProject";
import { User } from "./User";
import { Company } from "./Company";

@Entity({ name: "companyemployeeprojects" })
export class CompanyEmployeeProject {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => CompanyEmployee, (employee) => employee.employeeProjects)
  @JoinColumn({ name: "employeeid" })
  employee!: CompanyEmployee;

  @ManyToOne(() => Company, { nullable: false })
  @JoinColumn({ name: "companyid" })
  company!: Company;

  @ManyToOne(() => CompanyProject, (project) => project.projectEmployees)
  @JoinColumn({ name: "projectid" })
  project!: CompanyProject;

  @Column({ nullable: true })
  position?: string; // örnek: "Şantiye Şefi";

  @Column({ nullable: true, type: "text" })
  description?: string;

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
