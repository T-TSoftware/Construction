import { MigrationInterface, QueryRunner } from "typeorm";

export class Adjcurrentprje1745640598644 implements MigrationInterface {
    name = 'Adjcurrentprje1745640598644'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "artikonsept"."projectcurrents" ALTER COLUMN "description" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "artikonsept"."projectcurrents" ALTER COLUMN "description" DROP NOT NULL`);
    }

}
