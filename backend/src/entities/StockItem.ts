import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "stockitems" })
export class StockItem {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  code!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  unit!: string; // örnek: kg, ton, adet

  @Column({ unique: true })
  category!: string; // örnek: demir, kalıp, beton

  @Column({ name: "stockableyn", default: "Y" })
  stockableYN!: "Y" | "N";

  @CreateDateColumn({
    name: "createdatetime",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdatetime!: Date;

  @UpdateDateColumn({
    name: "updatedatetime",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  updatedatetime!: Date;
}
