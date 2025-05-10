import { ViewEntity, ViewColumn } from "typeorm";

@ViewEntity({
  name: "vw_companybalances",
  schema: "artikonsept",
  expression: `SELECT id, name, amount, currency, "companyId" FROM artikonsept.companybalances`,
})
export class CompanyBalanceView {
  @ViewColumn() id!: number;
  @ViewColumn() code!: string;
  @ViewColumn() name!: string;
  @ViewColumn() amount!: number;
  @ViewColumn() currency!: string;
  /*@ViewColumn() createdBy!: string;
  @ViewColumn() updatedBy!: string;
  @ViewColumn() createdatetime!: Date;
  @ViewColumn() updatedatetime!: Date;*/
  @ViewColumn({ name: "companyid" }) companyId!: string;
  //@ViewColumn({ name: "companyname" }) companyName!: string;
}
