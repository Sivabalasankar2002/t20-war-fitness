import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { Member, MemberStatus } from '../members/member.entity';
import { Payment } from '../payments/payment.entity';

@Injectable()
export class DashboardService {
    constructor(
        @InjectRepository(Member) private readonly membersRepo: Repository<Member>,
        @InjectRepository(Payment) private readonly paymentsRepo: Repository<Payment>,
    ) {}

    async stats() {
        const now = new Date();
        const in7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const [active, expired, soon] = await Promise.all([
            this.membersRepo.count({ where: { status: MemberStatus.ACTIVE } }),
            this.membersRepo.count({ where: { status: MemberStatus.EXPIRED } }),
            this.membersRepo.count({ where: { status: MemberStatus.SOON_TO_EXPIRE } }),
        ]);
        const totalFeesRow = await this.paymentsRepo
            .createQueryBuilder('p')
            .select('COALESCE(SUM(p.amount),0)', 'sum')
            .getRawOne<{ sum: string }>();
        const totalFees = Number(totalFeesRow?.sum ?? 0);
        const upcomingExpiries = await this.membersRepo.count({ where: { endDate: Between(now.toISOString().slice(0,10), in7.toISOString().slice(0,10)) } });
        return { active, expired, totalFees, upcomingExpiries };
    }
}


