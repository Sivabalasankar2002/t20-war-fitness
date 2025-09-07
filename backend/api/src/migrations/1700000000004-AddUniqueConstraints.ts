import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueConstraints1700000000004 implements MigrationInterface {
    name = 'AddUniqueConstraints1700000000004'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add unique constraints for email and phone
        await queryRunner.query(`ALTER TABLE "members" ADD CONSTRAINT "UQ_members_email" UNIQUE ("email")`);
        await queryRunner.query(`ALTER TABLE "members" ADD CONSTRAINT "UQ_members_phone" UNIQUE ("phone")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "members" DROP CONSTRAINT "UQ_members_email"`);
        await queryRunner.query(`ALTER TABLE "members" DROP CONSTRAINT "UQ_members_phone"`);
    }
}
