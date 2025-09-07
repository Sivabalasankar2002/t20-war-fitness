import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Member } from './member.entity';
import { MembershipPlan } from '../membership-plans/membership-plan.entity';

@Entity('member_plan_history')
export class MemberPlanHistory {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Member, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'member_id' })
    member: Member;

    @ManyToOne(() => MembershipPlan, { nullable: true })
    @JoinColumn({ name: 'from_plan_id' })
    fromPlan?: MembershipPlan | null;

    @ManyToOne(() => MembershipPlan, { nullable: false })
    @JoinColumn({ name: 'to_plan_id' })
    toPlan: MembershipPlan;

    @CreateDateColumn({ name: 'changed_at' })
    changedAt: Date;
}


