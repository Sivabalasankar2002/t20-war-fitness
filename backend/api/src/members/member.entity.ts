import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { MembershipPlan } from '../membership-plans/membership-plan.entity';
import { Payment } from '../payments/payment.entity';
import { Checkin } from '../checkins/checkin.entity';

export enum MemberStatus {
	ACTIVE = 'active',
	EXPIRED = 'expired',
	SOON_TO_EXPIRE = 'soon_to_expire',
}

@Entity('members')
export class Member {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	name: string;

	@Column({ type: 'int' })
	age: number;

	@Column({ nullable: true })
	phone?: string;

	@Column({ nullable: true })
	email?: string;

	@Column({ type: 'date', name: 'start_date' })
	startDate: string;

	@Column({ type: 'date', name: 'end_date' })
	endDate: string;

	@Column({ type: 'enum', enum: MemberStatus, default: MemberStatus.ACTIVE })
	status: MemberStatus;

	@Column({ type: 'int', name: 'balance_days', default: 0 })
	balanceDays: number;

	@Column({ type: 'decimal', precision: 10, scale: 2, name: 'fees_paid', default: 0 })
	feesPaid: number;

	@ManyToOne(() => MembershipPlan, { eager: true, nullable: false })
	@JoinColumn({ name: 'membership_plan_id' })
	membershipPlan: MembershipPlan;

	@OneToMany(() => Payment, (payment) => payment.member)
	payments: Payment[];

	@OneToMany(() => Checkin, (checkin) => checkin.member)
	checkins: Checkin[];

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt: Date;
}


