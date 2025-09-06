import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Member } from '../members/member.entity';

@Entity('checkins')
export class Checkin {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@ManyToOne(() => Member, (member) => member.checkins, { nullable: false })
	@JoinColumn({ name: 'member_id' })
	member: Member;

	@Column({ type: 'timestamp', name: 'checkin_at' })
	checkinAt: Date;

	@Column({ type: 'timestamp', name: 'checkout_at', nullable: true })
	checkoutAt?: Date;

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;
}


