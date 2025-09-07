import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Member } from '../members/member.entity';
import { MembershipPeriod } from '../members/membership-period.entity';

export enum PaymentMethod {
	CASH = 'cash',
	DIGITAL = 'digital',
}

@Entity('payments')
export class Payment {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@ManyToOne(() => Member, (member) => member.payments, { nullable: false })
	@JoinColumn({ name: 'member_id' })
	member: Member;

	@ManyToOne(() => MembershipPeriod, (period) => period.payments, { nullable: false })
	@JoinColumn({ name: 'membership_period_id' })
	membershipPeriod: MembershipPeriod;

	@Column('decimal', { precision: 10, scale: 2 })
	amount: number;

	@Column({ type: 'date', name: 'paid_on' })
	paidOn: string;

	@Column({ type: 'enum', enum: PaymentMethod, default: PaymentMethod.CASH })
	method: PaymentMethod;

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;
}


