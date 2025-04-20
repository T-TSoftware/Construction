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
import { User } from "./User";

@Entity({ name: "projectsubcontractors" })
export class ProjectSubcontractor {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  code!: string;

  @ManyToOne(() => CompanyProject)
  @JoinColumn({ name: "projectid" }) // ✅ all lower
  project!: CompanyProject;

  @Column({ name: "companyname", nullable: true }) // ✅ all lower
  companyName?: string;

  @Column()
  category!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column()
  unit!: string;

  @Column({ name: "unitprice", type: "numeric", nullable: true }) // ✅ all lower
  unitPrice?: number;

  @Column({ type: "numeric", nullable: true })
  quantity?: number;

  @Column({ name: "contractamount", type: "numeric", nullable: true }) // ✅ all lower
  contractAmount?: number;

  @Column({ name: "paidamount", type: "numeric", nullable: true }) // ✅ all lower
  paidAmount?: number;

  @Column({ name: "remainingamount", type: "numeric", nullable: true }) // ✅ all lower
  remainingAmount?: number | null;

  @Column({ default: "pending", nullable: true })
  status!: string;

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
  @JoinColumn({ name: "createdby" }) // ✅ all lower
  createdBy!: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: "updatedby" }) // ✅ all lower
  updatedBy!: User;
}
