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
import { CompanyEmployee } from "./CompanyEmployee";
import { User } from "./User";

export enum LeaveType {
  PAID = "PAID", // Yıllık Ücretli
  UNPAID = "UNPAID", // Yıllık Ücretsiz
  SICK = "SICK", // Rapor
  ROAD = "ROAD", // Yol
  EXCUSE = "EXCUSE", // Mazeret
}

@Entity({ name: "companyemployeeleave" })
export class CompanyEmployeeLeave {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => CompanyEmployee)
  @JoinColumn({ name: "employeeid" })
  employee!: CompanyEmployee;

  @Column({ name: "startdate", type: "timestamp", nullable: true })
  startDate?: Date;

  @Column({ name: "enddate", type: "timestamp", nullable: true })
  endDate?: Date;

  @Column({ type: "numeric", name: "leavedaycount" })
  leaveDayCount!: number;

  @Column({
    type: "enum",
    enum: LeaveType,
    name: "type",
  })
  type!: LeaveType;

  @Column({ nullable: true })
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
