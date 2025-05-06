// src/entities/ProjectCurrent.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from "typeorm";
import { CompanyProject } from "./CompanyProject";
import { CompanyBalance } from "./CompanyBalance";
import { User } from "./User";

@Entity({ name: "projectcurrents" })
export class ProjectCurrent {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => CompanyProject)
  @JoinColumn({ name: "projectid" })
  project!: CompanyProject;

  @ManyToOne(() => CompanyBalance)
  @JoinColumn({ name: "balanceid" })
  balance!: CompanyBalance;

  @Column()
  type!: string;

  @Column("numeric", { precision: 15, scale: 2 })
  amount!: number;

  @Column()
  currency!: string;

  @Column({ type: "text", nullable: false })
  description?: string;

  @Column({ name: "transactiondate", type: "timestamp", nullable: false })
  transactionDate!: Date;

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
