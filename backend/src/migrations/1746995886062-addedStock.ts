import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedStock1746995886062 implements MigrationInterface {
    name = 'AddedStock1746995886062'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "artikonsept"."companystocks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying NOT NULL, "name" character varying NOT NULL, "category" character varying NOT NULL, "description" character varying, "unit" character varying NOT NULL, "quantity" numeric NOT NULL DEFAULT '0', "minimumQuantity" numeric NOT NULL DEFAULT '0', "location" character varying, "stockdate" date, "createdatetime" TIMESTAMP NOT NULL DEFAULT now(), "updatedatetime" TIMESTAMP NOT NULL DEFAULT now(), "companyid" uuid, "projectid" uuid, "createdby" uuid, "updatedby" uuid, CONSTRAINT "UQ_849d4f2554512183a531bcec335" UNIQUE ("code"), CONSTRAINT "PK_d553abc01f925fc7be44e5dda18" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "artikonsept"."companystocks" ADD CONSTRAINT "FK_bdd108f6e8571f575a878714bff" FOREIGN KEY ("companyid") REFERENCES "artikonsept"."company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "artikonsept"."companystocks" ADD CONSTRAINT "FK_acb532eb4df3345434a858cfb28" FOREIGN KEY ("projectid") REFERENCES "artikonsept"."companyprojects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "artikonsept"."companystocks" ADD CONSTRAINT "FK_39162977c66cb184f101ccf81ce" FOREIGN KEY ("createdby") REFERENCES "artikonsept"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "artikonsept"."companystocks" ADD CONSTRAINT "FK_17ab17f0bc89cc36801a1101da9" FOREIGN KEY ("updatedby") REFERENCES "artikonsept"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "artikonsept"."companystocks" DROP CONSTRAINT "FK_17ab17f0bc89cc36801a1101da9"`);
        await queryRunner.query(`ALTER TABLE "artikonsept"."companystocks" DROP CONSTRAINT "FK_39162977c66cb184f101ccf81ce"`);
        await queryRunner.query(`ALTER TABLE "artikonsept"."companystocks" DROP CONSTRAINT "FK_acb532eb4df3345434a858cfb28"`);
        await queryRunner.query(`ALTER TABLE "artikonsept"."companystocks" DROP CONSTRAINT "FK_bdd108f6e8571f575a878714bff"`);
        await queryRunner.query(`DROP TABLE "artikonsept"."companystocks"`);
    }

}
