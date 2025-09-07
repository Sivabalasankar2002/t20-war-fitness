import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMemberPlanHistory1700000000003 implements MigrationInterface {
    name = 'AddMemberPlanHistory1700000000003'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS member_plan_history (
              id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
              member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
              from_plan_id uuid NULL REFERENCES membership_plans(id),
              to_plan_id uuid NOT NULL REFERENCES membership_plans(id),
              changed_at TIMESTAMP NOT NULL DEFAULT now()
            )
        `);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_mph_member ON member_plan_history(member_id)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP INDEX IF EXISTS idx_mph_member');
        await queryRunner.query('DROP TABLE IF EXISTS member_plan_history');
    }
}


