import { MigrationInterface, QueryRunner } from "typeorm";

export class Adjcurrentprj1745640474193 implements MigrationInterface {
    name = 'Adjcurrentprj1745640474193'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "artikonsept"."projectcurrents" ADD "description" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "artikonsept"."projectcurrents" DROP COLUMN "description"`);
    }

}
