import { MigrationInterface, QueryRunner } from "typeorm";

export class Projectcurrentnew1745618240583 implements MigrationInterface {
    name = 'Projectcurrentnew1745618240583'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "artikonsept"."projectcurrents" DROP COLUMN "vat"`);
        await queryRunner.query(`ALTER TABLE "artikonsept"."projectcurrents" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "artikonsept"."projectcurrents" ADD "currency" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "artikonsept"."projectcurrents" ALTER COLUMN "amount" TYPE numeric(15,2)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "artikonsept"."projectcurrents" ALTER COLUMN "amount" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "artikonsept"."projectcurrents" DROP COLUMN "currency"`);
        await queryRunner.query(`ALTER TABLE "artikonsept"."projectcurrents" ADD "description" text`);
        await queryRunner.query(`ALTER TABLE "artikonsept"."projectcurrents" ADD "vat" numeric`);
    }

}
