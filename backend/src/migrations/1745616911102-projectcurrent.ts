import { MigrationInterface, QueryRunner } from "typeorm";

export class Projectcurrent1745616911102 implements MigrationInterface {
    name = 'Projectcurrent1745616911102'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "artikonsept"."projectcurrents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" character varying NOT NULL, "amount" numeric NOT NULL, "vat" numeric, "description" text, "transactiondata" text, "createdatetime" TIMESTAMP NOT NULL DEFAULT now(), "updatedatetime" TIMESTAMP NOT NULL DEFAULT now(), "projectid" uuid, "balanceid" uuid, "createdby" uuid, "updatedby" uuid, CONSTRAINT "PK_128103803588a80c166b3d45bf2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "artikonsept"."projectcurrents" ADD CONSTRAINT "FK_c8cac5a0e1ce3604750125dc1e0" FOREIGN KEY ("projectid") REFERENCES "artikonsept"."companyprojects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "artikonsept"."projectcurrents" ADD CONSTRAINT "FK_f18e6bee6f0ffed19bf06d6c92f" FOREIGN KEY ("balanceid") REFERENCES "artikonsept"."companybalances"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "artikonsept"."projectcurrents" ADD CONSTRAINT "FK_f52a15ae584b076c41d7835564e" FOREIGN KEY ("createdby") REFERENCES "artikonsept"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "artikonsept"."projectcurrents" ADD CONSTRAINT "FK_938cfd646d8d6cb9e88c4844e44" FOREIGN KEY ("updatedby") REFERENCES "artikonsept"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "artikonsept"."projectcurrents" DROP CONSTRAINT "FK_938cfd646d8d6cb9e88c4844e44"`);
        await queryRunner.query(`ALTER TABLE "artikonsept"."projectcurrents" DROP CONSTRAINT "FK_f52a15ae584b076c41d7835564e"`);
        await queryRunner.query(`ALTER TABLE "artikonsept"."projectcurrents" DROP CONSTRAINT "FK_f18e6bee6f0ffed19bf06d6c92f"`);
        await queryRunner.query(`ALTER TABLE "artikonsept"."projectcurrents" DROP CONSTRAINT "FK_c8cac5a0e1ce3604750125dc1e0"`);
        await queryRunner.query(`DROP TABLE "artikonsept"."projectcurrents"`);
    }

}
