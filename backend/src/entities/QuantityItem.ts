import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Company } from "./Company";

@Entity({ name: "quantityitems" })
export class QuantityItem {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Company, { nullable: false })
  @JoinColumn({ name: "companyid" })
  company!: Company;

  @Column({ unique: true })
  code!: string;

  @Column()
  name!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdatetime!: Date;

  @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  updatedatetime!: Date;
}
