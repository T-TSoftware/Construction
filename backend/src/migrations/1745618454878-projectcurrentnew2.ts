import { MigrationInterface, QueryRunner } from "typeorm";

export class Projectcurrentnew21745618454878 implements MigrationInterface {
    name = 'Projectcurrentnew21745618454878'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "artikonsept"."projectcurrents" RENAME COLUMN "transactiondata" TO "transactiondate"`);
        await queryRunner.query(`ALTER TABLE "artikonsept"."projectcurrents" DROP COLUMN "transactiondate"`);
        await queryRunner.query(`ALTER TABLE "artikonsept"."projectcurrents" ADD "transactiondate" TIMESTAMP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "artikonsept"."projectcurrents" DROP COLUMN "transactiondate"`);
        await queryRunner.query(`ALTER TABLE "artikonsept"."projectcurrents" ADD "transactiondate" text`);
        await queryRunner.query(`ALTER TABLE "artikonsept"."projectcurrents" RENAME COLUMN "transactiondate" TO "transactiondata"`);
    }

}
