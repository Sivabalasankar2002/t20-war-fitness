import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('membership_plans')
export class MembershipPlan {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	name: string;

	@Column('decimal', { precision: 10, scale: 2 })
	fees: number;

	@Column({ type: 'int', name: 'duration_days' })
	durationDays: number;

	@Column({ type: 'text', nullable: true })
	features?: string;
	
	@Column({ type: 'boolean', name: 'is_active', default: true })
	isActive: boolean;

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt: Date;
}


