import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
    name = 'InitialSchema1700000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
        await queryRunner.query(`DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'member_status_enum') THEN
              CREATE TYPE "member_status_enum" AS ENUM ('active','expired','soon_to_expire');
            END IF;
          END $$;`);

        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "email" varchar NOT NULL UNIQUE,
                "password_hash" varchar NOT NULL,
                "role" varchar NOT NULL DEFAULT 'gym_manager',
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now()
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "membership_plans" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "name" varchar NOT NULL,
                "fees" numeric(10,2) NOT NULL,
                "duration_days" integer NOT NULL,
                "features" text NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now()
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "members" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "name" varchar NOT NULL,
                "age" integer NOT NULL,
                "phone" varchar NULL,
                "email" varchar NULL,
                "start_date" date NOT NULL,
                "end_date" date NOT NULL,
                "status" "member_status_enum" NOT NULL DEFAULT 'active',
                "balance_days" integer NOT NULL DEFAULT 0,
                "fees_paid" numeric(10,2) NOT NULL DEFAULT 0,
                "membership_plan_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "fk_members_plan" FOREIGN KEY ("membership_plan_id") REFERENCES "membership_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "payments" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "member_id" uuid NOT NULL,
                "amount" numeric(10,2) NOT NULL,
                "paid_on" date NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "fk_payments_member" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "checkins" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "member_id" uuid NOT NULL,
                "checkin_at" TIMESTAMP NOT NULL,
                "checkout_at" TIMESTAMP NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "fk_checkins_member" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE
            )
        `);

        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_members_status ON members(status)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_members_plan ON members(membership_plan_id)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_payments_member ON payments(member_id)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_checkins_member ON checkins(member_id)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP INDEX IF EXISTS idx_checkins_member');
        await queryRunner.query('DROP INDEX IF EXISTS idx_payments_member');
        await queryRunner.query('DROP INDEX IF EXISTS idx_members_plan');
        await queryRunner.query('DROP INDEX IF EXISTS idx_members_status');
        await queryRunner.query('DROP TABLE IF EXISTS "checkins"');
        await queryRunner.query('DROP TABLE IF EXISTS "payments"');
        await queryRunner.query('DROP TABLE IF EXISTS "members"');
        await queryRunner.query('DROP TABLE IF EXISTS "membership_plans"');
        await queryRunner.query('DROP TABLE IF EXISTS "users"');
        await queryRunner.query('DROP TYPE IF EXISTS "member_status_enum"');
    }
}


