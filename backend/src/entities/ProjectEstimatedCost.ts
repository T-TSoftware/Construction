import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from "typeorm";
import { User } from "./User";
import { CompanyProject } from "./CompanyProject";

@Entity({ name: "projectestimatedcosts" })
export class ProjectEstimatedCost {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  code!: string;

  @Column()
  name!: string;

  @Column()
  category!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column()
  unit!: string;

  @Column({ name: "unitprice", type: "numeric" })
  unitPrice!: number;

  @Column({ type: "numeric" })
  quantity!: number;

  @Column({ name: "totalcost", type: "numeric" })
  totalCost!: number;

  @ManyToOne(() => CompanyProject, (project) => project.estimatedCosts)
  @JoinColumn({ name: "projectid" })
  project!: CompanyProject;

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
