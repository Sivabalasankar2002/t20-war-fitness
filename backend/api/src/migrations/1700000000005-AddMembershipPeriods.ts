import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMembershipPeriods1700000000005 implements MigrationInterface {
    name = 'AddMembershipPeriods1700000000005'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create period_status_enum first
        await queryRunner.query(`
            DO $$ BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'period_status_enum') THEN
                    CREATE TYPE "period_status_enum" AS ENUM ('active', 'completed', 'cancelled');
                END IF;
            END $$;
        `);

        // Create membership_periods table
        await queryRunner.query(`
            CREATE TABLE "membership_periods" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "member_id" uuid NOT NULL,
                "membership_plan_id" uuid NOT NULL,
                "start_date" date NOT NULL,
                "end_date" date NOT NULL,
                "plan_fees" numeric(10,2) NOT NULL,
                "fees_paid" numeric(10,2) NOT NULL DEFAULT 0,
                "due_amount" numeric(10,2) NOT NULL DEFAULT 0,
                "status" "period_status_enum" NOT NULL DEFAULT 'active',
                "notes" text,
                "period_type" varchar(50),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "fk_membership_periods_member" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE,
                CONSTRAINT "fk_membership_periods_plan" FOREIGN KEY ("membership_plan_id") REFERENCES "membership_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE
            )
        `);

        // Add membership_period_id to payments table
        await queryRunner.query(`ALTER TABLE "payments" ADD "membership_period_id" uuid`);
        await queryRunner.query(`
            ALTER TABLE "payments" 
            ADD CONSTRAINT "fk_payments_membership_period" 
            FOREIGN KEY ("membership_period_id") REFERENCES "membership_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);

        // Create indexes
        await queryRunner.query(`CREATE INDEX "idx_membership_periods_member" ON "membership_periods"("member_id")`);
        await queryRunner.query(`CREATE INDEX "idx_membership_periods_status" ON "membership_periods"("status")`);
        await queryRunner.query(`CREATE INDEX "idx_payments_period" ON "payments"("membership_period_id")`);

        // Migrate existing data - create membership periods for existing members
        await queryRunner.query(`
            INSERT INTO "membership_periods" (
                "member_id", "membership_plan_id", "start_date", "end_date", 
                "plan_fees", "fees_paid", "due_amount", "status", "period_type"
            )
            SELECT 
                m.id,
                m.membership_plan_id,
                m.start_date,
                m.end_date,
                mp.fees,
                m.fees_paid,
                m.due_amount,
                CASE 
                    WHEN m.status = 'active' THEN 'active'::period_status_enum
                    WHEN m.status = 'expired' THEN 'completed'::period_status_enum
                    ELSE 'completed'::period_status_enum
                END,
                'initial'
            FROM "members" m
            JOIN "membership_plans" mp ON m.membership_plan_id = mp.id
        `);

        // Update payments to link to membership periods
        await queryRunner.query(`
            UPDATE "payments" p
            SET "membership_period_id" = mp.id
            FROM "membership_periods" mp
            WHERE p.member_id = mp.member_id
            AND p.membership_period_id IS NULL
        `);

        // Make membership_period_id NOT NULL after data migration
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "membership_period_id" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "fk_payments_membership_period"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "membership_period_id"`);
        await queryRunner.query(`DROP INDEX "idx_payments_period"`);
        await queryRunner.query(`DROP INDEX "idx_membership_periods_status"`);
        await queryRunner.query(`DROP INDEX "idx_membership_periods_member"`);
        await queryRunner.query(`DROP TABLE "membership_periods"`);
        await queryRunner.query(`DROP TYPE "period_status_enum"`);
    }
}
