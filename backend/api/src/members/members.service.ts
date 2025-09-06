import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Member, MemberStatus } from './member.entity';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { MembershipPlan } from '../membership-plans/membership-plan.entity';

@Injectable()
export class MembersService {
	constructor(
		@InjectRepository(Member) private readonly membersRepo: Repository<Member>,
		@InjectRepository(MembershipPlan) private readonly plansRepo: Repository<MembershipPlan>,
	) {}

	async create(dto: CreateMemberDto): Promise<Member> {
		const plan = await this.plansRepo.findOne({ where: { id: dto.membershipPlanId } });
		if (!plan) {
			throw new NotFoundException('Membership plan not found');
		}

		const member = this.membersRepo.create({
			name: dto.name,
			age: dto.age,
			phone: dto.phone,
			email: dto.email,
			startDate: dto.startDate,
			endDate: dto.endDate,
			feesPaid: dto.feesPaid ?? 0,
			balanceDays: dto.balanceDays ?? this.calculateBalanceDays(dto.startDate, dto.endDate),
			status: dto.status ?? this.calculateStatus(dto.endDate),
			membershipPlan: plan,
		});

		return this.membersRepo.save(member);
	}

	async findAll(filter?: { id?: string; name?: string; phone?: string; email?: string; status?: MemberStatus; minAge?: number; maxAge?: number; startFrom?: string; startTo?: string; endFrom?: string; endTo?: string; page?: number; limit?: number }): Promise<{ data: Member[]; total: number; page: number; limit: number }> {
		const qb = this.membersRepo.createQueryBuilder('m').leftJoinAndSelect('m.membershipPlan', 'plan');

		// Unified free-text search if front-end sent same query into multiple fields
		const q = filter?.name ?? filter?.email ?? filter?.phone ?? undefined;
		const sameQ = !!q &&
			(filter?.name === q) &&
			(filter?.email === undefined || filter?.email === q) &&
			(filter?.phone === undefined || filter?.phone === q) &&
			(filter?.id === undefined || filter?.id === q);
		if (sameQ && q) {
			qb.andWhere(new Brackets((where) => {
				where.where('LOWER(m.name) LIKE :q', { q: `%${q.toLowerCase()}%` })
					.orWhere('LOWER(m.email) LIKE :q', { q: `%${q.toLowerCase()}%` })
					.orWhere('m.phone LIKE :q', { q: `%${q}%` });
			}));
		} else {
			if (filter?.name) qb.andWhere('LOWER(m.name) LIKE :name', { name: `%${filter.name.toLowerCase()}%` });
			if (filter?.phone) qb.andWhere('m.phone LIKE :phone', { phone: `%${filter.phone}%` });
			if (filter?.email) qb.andWhere('LOWER(m.email) LIKE :email', { email: `%${filter.email.toLowerCase()}%` });
			if (filter?.id && isUuidString(filter.id)) qb.andWhere('m.id = :id', { id: filter.id });
		}
		if (filter?.status) {
			qb.andWhere('m.status = :status', { status: filter.status });
		}
		if (filter?.minAge) qb.andWhere('m.age >= :minAge', { minAge: filter.minAge });
		if (filter?.maxAge) qb.andWhere('m.age <= :maxAge', { maxAge: filter.maxAge });
		if (filter?.startFrom) qb.andWhere('m.start_date >= :startFrom', { startFrom: filter.startFrom });
		if (filter?.startTo) qb.andWhere('m.start_date <= :startTo', { startTo: filter.startTo });
		if (filter?.endFrom) qb.andWhere('m.end_date >= :endFrom', { endFrom: filter.endFrom });
		if (filter?.endTo) qb.andWhere('m.end_date <= :endTo', { endTo: filter.endTo });
		// Priority ordering: expired first, then soon_to_expire, then active; within each, most recently updated
		qb.addSelect(`CASE 
			WHEN m.status = :expired THEN 0 
			WHEN m.status = :soon THEN 1 
			ELSE 2 END`, 'status_rank')
			.setParameters({ expired: MemberStatus.EXPIRED, soon: MemberStatus.SOON_TO_EXPIRE })
			.orderBy('status_rank', 'ASC')
			.addOrderBy('m.updatedAt', 'DESC');
		const page = filter?.page && filter.page > 0 ? filter.page : 1;
		const limit = filter?.limit && filter.limit > 0 ? Math.min(filter.limit, 100) : 10;
		qb.skip((page - 1) * limit).take(limit);
		const [data, total] = await qb.getManyAndCount();
		return { data, total, page, limit };
	}

	async findOne(id: string): Promise<Member> {
		const member = await this.membersRepo.findOne({ where: { id } });
		if (!member) throw new NotFoundException('Member not found');
		return member;
	}

	async update(id: string, dto: UpdateMemberDto): Promise<Member> {
		const member = await this.findOne(id);
		if (dto.membershipPlanId) {
			const plan = await this.plansRepo.findOne({ where: { id: dto.membershipPlanId } });
			if (!plan) throw new NotFoundException('Membership plan not found');
			member.membershipPlan = plan;
		}
		Object.assign(member, dto);
		if (dto.startDate || dto.endDate) {
			const start = dto.startDate ?? member.startDate;
			const end = dto.endDate ?? member.endDate;
			member.balanceDays = this.calculateBalanceDays(start, end);
			member.status = this.calculateStatus(end);
		}
		return this.membersRepo.save(member);
	}

	private calculateBalanceDays(startDate: string, endDate: string): number {
		const start = new Date(startDate);
		const end = new Date(endDate);
		const diffMs = end.getTime() - start.getTime();
		return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
	}

	private calculateStatus(endDate: string): MemberStatus {
		const end = new Date(endDate).getTime();
		const now = Date.now();
		const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
		if (daysLeft < 0) return MemberStatus.EXPIRED;
		if (daysLeft <= 7) return MemberStatus.SOON_TO_EXPIRE;
		return MemberStatus.ACTIVE;
	}
}

function isUuidString(value: string): boolean {
    // Simple UUID v4 format check
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}


