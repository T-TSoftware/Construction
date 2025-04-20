import { ViewEntity, ViewColumn } from "typeorm";

@ViewEntity({
  name: "v_projectcostsummary",
  schema: "artikonsept",
})
export class ProjectCostSummary {

  @ViewColumn()
  projectid!: string;

  @ViewColumn()
  projectcode!: string; // 🔥 yeni eklendi

  @ViewColumn()
  quantityitemcode!: string;

  @ViewColumn()
  quantityitemname!: string;

  @ViewColumn()
  expectedquantity!: number;

  @ViewColumn()
  unit!: string;

  @ViewColumn()
  suppliedquantity!: number;

  @ViewColumn()
  expectedpayment!: number;

  @ViewColumn()
  totalpayment!: number;

  @ViewColumn()
  remainingpayment!: number;

  @ViewColumn()
  remainingquantity!: number;

  @ViewColumn()
  overlimit!: string; // 'Y' | 'N'
}
