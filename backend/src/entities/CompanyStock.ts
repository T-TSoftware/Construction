import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Unique,
  OneToMany,
} from "typeorm";
import { Company } from "./Company";
import { CompanyProject } from "./CompanyProject";
import { User } from "./User";
import { CompanyOrder } from "./CompanyOrder";

@Entity({ name: "companystocks" }) // ✅ tablo adı burada verildi
@Unique(["category", "name"]) // ✅ Bileşik benzersizlik tanımı
export class CompanyStock {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  code!: string;

  @Column()
  name!: string;

  @Column()
  category!: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  unit!: string;

  @Column("numeric", { default: 0 })
  quantity!: number;

  @Column("numeric", { default: 0 })
  minimumQuantity!: number;

  @Column({ name: "location", nullable: true })
  location?: string;

  @Column({ name: "stockdate", type: "date", nullable: true })
  stockDate?: Date;

  @ManyToOne(() => Company)
  @JoinColumn({ name: "companyid" })
  company!: Company;

  @ManyToOne(() => CompanyProject, { nullable: true })
  @JoinColumn({ name: "projectid" })
  project!: CompanyProject | null;

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

  @OneToMany(() => CompanyOrder, (order) => order.stock)
  orders!: CompanyOrder[];
}
