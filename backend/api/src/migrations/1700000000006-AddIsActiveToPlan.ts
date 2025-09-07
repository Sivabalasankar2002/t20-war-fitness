import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsActiveToPlan1700000000006 implements MigrationInterface {
    name = 'AddIsActiveToPlan1700000000006'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add is_active column to membership_plans table with default true
        await queryRunner.query(`ALTER TABLE "membership_plans" ADD "is_active" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "membership_plans" DROP COLUMN "is_active"`);
    }
}
