import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPaymentMethod1700000000001 implements MigrationInterface {
    name = 'AddPaymentMethod1700000000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method_enum') THEN
              CREATE TYPE payment_method_enum AS ENUM ('cash','digital');
            END IF;
          END $$;`);
        await queryRunner.query(`ALTER TABLE payments ADD COLUMN IF NOT EXISTS method payment_method_enum DEFAULT 'cash' NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE payments DROP COLUMN IF EXISTS method`);
        await queryRunner.query(`DO $$ BEGIN
            IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method_enum') THEN
              DROP TYPE payment_method_enum;
            END IF;
          END $$;`);
    }
}


