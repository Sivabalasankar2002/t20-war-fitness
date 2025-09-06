import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Member } from '../members/member.entity';

@Entity('payments')
export class Payment {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@ManyToOne(() => Member, (member) => member.payments, { nullable: false })
	@JoinColumn({ name: 'member_id' })
	member: Member;

	@Column('decimal', { precision: 10, scale: 2 })
	amount: number;

	@Column({ type: 'date', name: 'paid_on' })
	paidOn: string;

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;
}


