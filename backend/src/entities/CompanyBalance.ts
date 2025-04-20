import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from "typeorm";
import { Company } from "./Company";

@Entity({ name: "companybalances" })
export class CompanyBalance {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  code!: string;

  @ManyToOne(() => Company, (company) => company.balances, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "companyid" })
  company!: Company;

  @Column()
  name!: string;

  @Column("numeric", { precision: 15, scale: 2 })
  amount!: number;

  @Column()
  currency!: string;

  @Column({ name: "createdby" })
  createdBy!: string;

  @Column({ name: "updatedby" })
  updatedBy!: string;

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
