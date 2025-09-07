import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Member } from './member.entity';
import { MembershipPlan } from '../membership-plans/membership-plan.entity';
import { Payment } from '../payments/payment.entity';

export enum PeriodStatus {
	ACTIVE = 'active',
	COMPLETED = 'completed',
	CANCELLED = 'cancelled',
}

@Entity('membership_periods')
export class MembershipPeriod {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@ManyToOne(() => Member, (member) => member.membershipPeriods, { nullable: false })
	@JoinColumn({ name: 'member_id' })
	member: Member;

	@ManyToOne(() => MembershipPlan, { nullable: false })
	@JoinColumn({ name: 'membership_plan_id' })
	membershipPlan: MembershipPlan;

	@Column({ type: 'date', name: 'start_date' })
	startDate: string;

	@Column({ type: 'date', name: 'end_date' })
	endDate: string;

	@Column({ type: 'decimal', precision: 10, scale: 2, name: 'plan_fees' })
	planFees: number;

	@Column({ type: 'decimal', precision: 10, scale: 2, name: 'fees_paid', default: 0 })
	feesPaid: number;

	@Column({ type: 'decimal', precision: 10, scale: 2, name: 'due_amount', default: 0 })
	dueAmount: number;

	@Column({ type: 'enum', enum: PeriodStatus, default: PeriodStatus.ACTIVE })
	status: PeriodStatus;

	@Column({ type: 'text', nullable: true })
	notes?: string;

	@Column({ type: 'varchar', length: 50, nullable: true, name: 'period_type' })
	periodType?: string; // 'initial', 'renewal', 'plan_switch'

	@OneToMany(() => Payment, (payment) => payment.membershipPeriod)
	payments: Payment[];

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt: Date;
}
