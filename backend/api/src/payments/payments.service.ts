import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './payment.entity';
import { Member } from '../members/member.entity';

@Injectable()
export class PaymentsService {
    constructor(
        @InjectRepository(Payment) private readonly paymentsRepo: Repository<Payment>,
        @InjectRepository(Member) private readonly membersRepo: Repository<Member>,
    ) {}

    async record(memberId: string, amount: number, paidOn: string) {
        const member = await this.membersRepo.findOne({ where: { id: memberId } });
        if (!member) throw new NotFoundException('Member not found');
        const payment = this.paymentsRepo.create({ member, amount, paidOn });
        const saved = await this.paymentsRepo.save(payment);
        member.feesPaid = Number(member.feesPaid || 0) + Number(amount);
        await this.membersRepo.save(member);
        return saved;
    }

    async listForMember(memberId: string, page?: number, limit?: number) {
        const qb = this.paymentsRepo.createQueryBuilder('p').leftJoin('p.member', 'm').where('m.id = :memberId', { memberId }).orderBy('p.paidOn', 'DESC');
        if (page || limit) {
            const p = page && page > 0 ? page : 1;
            const l = limit && limit > 0 ? Math.min(limit, 100) : 10;
            qb.skip((p - 1) * l).take(l);
            const [data, total] = await qb.getManyAndCount();
            return { data, total, page: p, limit: l };
        }
        return qb.getMany();
    }
}



