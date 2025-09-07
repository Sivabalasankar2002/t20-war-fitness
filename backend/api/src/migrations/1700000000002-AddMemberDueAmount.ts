import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMemberDueAmount1700000000002 implements MigrationInterface {
    name = 'AddMemberDueAmount1700000000002'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE members ADD COLUMN IF NOT EXISTS due_amount numeric(10,2) NOT NULL DEFAULT 0`);
        // initialize due as max(plan.fees - fees_paid, 0)
        await queryRunner.query(`UPDATE members m SET due_amount = GREATEST(0, COALESCE((SELECT fees FROM membership_plans p WHERE p.id=m.membership_plan_id),0) - COALESCE(m.fees_paid,0))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE members DROP COLUMN IF EXISTS due_amount`);
    }
}


