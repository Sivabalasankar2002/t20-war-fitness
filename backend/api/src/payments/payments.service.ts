import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentMethod } from './payment.entity';
import { Member } from '../members/member.entity';
import { MembershipPeriod, PeriodStatus } from '../members/membership-period.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class PaymentsService {
    constructor(
        @InjectRepository(Payment) private readonly paymentsRepo: Repository<Payment>,
        @InjectRepository(Member) private readonly membersRepo: Repository<Member>,
        private readonly dataSource: DataSource,
    ) {}

    async record(memberId: string, amount: number, paidOn: string, method: PaymentMethod = PaymentMethod.CASH) {
        return this.dataSource.transaction(async (manager) => {
            const membersRepo = manager.getRepository(Member);
            const paymentsRepo = manager.getRepository(Payment);
            const periodsRepo = manager.getRepository(MembershipPeriod);

            const member = await membersRepo.findOne({ where: { id: memberId } });
            if (!member) throw new NotFoundException('Member not found');

            // Find the active membership period
            const activePeriod = await periodsRepo.findOne({ 
                where: { member: { id: memberId }, status: PeriodStatus.ACTIVE }
            });
            if (!activePeriod) throw new NotFoundException('No active membership period found');

            // simple dedupe: same amount+date within last minute
            const dup = await paymentsRepo.findOne({ where: { member: { id: memberId }, amount, paidOn } });
            if (dup) return dup;

            const payment = paymentsRepo.create({ 
                member, 
                membershipPeriod: activePeriod,
                amount: amount, 
                paidOn, 
                method 
            });
            const saved = await paymentsRepo.save(payment);

            // Ensure amount is a proper number
            const paymentAmount = Number(amount);
            if (isNaN(paymentAmount) || paymentAmount <= 0) {
                throw new Error('Invalid payment amount');
            }

            // Update member's total fees paid
            const oldMemberFeesPaid = Number(member.feesPaid || 0);
            const newMemberFeesPaid = oldMemberFeesPaid + paymentAmount;
            member.feesPaid = newMemberFeesPaid;
            
            const planFees = Number((member.membershipPlan as any)?.fees ?? 0);
            const newMemberDueAmount = Math.max(0, planFees - newMemberFeesPaid);
            member.dueAmount = newMemberDueAmount;
            
            console.log(`Payment processing - Member: ${member.id}`);
            console.log(`  Old fees paid: ${oldMemberFeesPaid}, Payment: ${paymentAmount}, New fees paid: ${newMemberFeesPaid}`);
            console.log(`  Plan fees: ${planFees}, New due amount: ${newMemberDueAmount}`);
            
            // Update the membership period's fees paid and due amount
            const oldPeriodFeesPaid = Number(activePeriod.feesPaid || 0);
            const newPeriodFeesPaid = oldPeriodFeesPaid + paymentAmount;
            activePeriod.feesPaid = newPeriodFeesPaid;
            
            const periodPlanFees = Number(activePeriod.planFees || 0);
            const newPeriodDueAmount = Math.max(0, periodPlanFees - newPeriodFeesPaid);
            activePeriod.dueAmount = newPeriodDueAmount;
            
            console.log(`Payment processing - Period: ${activePeriod.id}`);
            console.log(`  Old fees paid: ${oldPeriodFeesPaid}, Payment: ${paymentAmount}, New fees paid: ${newPeriodFeesPaid}`);
            console.log(`  Period plan fees: ${periodPlanFees}, New due amount: ${newPeriodDueAmount}`);
            
            // Save both entities in the correct order
            await membersRepo.save(member);
            await periodsRepo.save(activePeriod);

            return saved;
        });
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



