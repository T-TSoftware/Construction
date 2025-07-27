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
import { QuantityItem } from "./QuantityItem";
import { User } from "./User";
import { Company } from "./Company";

@Entity({ name: "projectquantities" })
export class ProjectQuantity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ nullable: true })
  code?: string;

  @ManyToOne(() => Company, { nullable: false })
  @JoinColumn({ name: "companyid" })
  company!: Company;

  @ManyToOne(() => CompanyProject)
  @JoinColumn({ name: "projectid" })
  project!: CompanyProject;

  @ManyToOne(() => QuantityItem)
  @JoinColumn({ name: "quantityitemid" })
  quantityItem!: QuantityItem;

  @Column({ type: "numeric" })
  quantity!: number;

  @Column()
  unit!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column()
  category!: string;

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
