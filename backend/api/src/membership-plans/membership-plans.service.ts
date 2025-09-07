import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MembershipPlan } from './membership-plan.entity';
import { Member } from '../members/member.entity';
import { MembershipPeriod } from '../members/membership-period.entity';

@Injectable()
export class MembershipPlansService {
    constructor(
        @InjectRepository(MembershipPlan)
        private readonly plansRepo: Repository<MembershipPlan>,
        @InjectRepository(Member)
        private readonly membersRepo: Repository<Member>,
        @InjectRepository(MembershipPeriod)
        private readonly periodsRepo: Repository<MembershipPeriod>,
    ) {}

    create(data: Pick<MembershipPlan, 'name' | 'fees' | 'durationDays' | 'features'>) {
        const plan = this.plansRepo.create(data);
        return this.plansRepo.save(plan);
    }

    findAll(includeInactive = false) {
        const where = includeInactive ? {} : { isActive: true };
        return this.plansRepo.find({ 
            where,
            order: { createdAt: 'DESC' } 
        });
    }

    async findOne(id: string) {
        const plan = await this.plansRepo.findOne({ where: { id } });
        if (!plan) throw new NotFoundException('Plan not found');
        return plan;
    }

    async update(id: string, data: Partial<MembershipPlan>) {
        const plan = await this.findOne(id);
        Object.assign(plan, data);
        return this.plansRepo.save(plan);
    }

    async remove(id: string) {
        const plan = await this.findOne(id);
        
        // Check if any active members are using this plan
        const activeMembers = await this.membersRepo.count({
            where: { membershipPlan: { id } }
        });
        
        if (activeMembers > 0) {
            throw new BadRequestException(
                `Cannot delete plan: ${activeMembers} member(s) are currently using this plan. ` +
                `Please transfer them to another plan first.`
            );
        }
        
        // Check if any membership periods reference this plan
        const periodsCount = await this.periodsRepo.count({
            where: { membershipPlan: { id } }
        });
        
        if (periodsCount > 0) {
            // Soft delete by marking as inactive instead of removing
            plan.isActive = false;
            await this.plansRepo.save(plan);
            return { deleted: false, deactivated: true };
        }
        
        // If no references, safe to delete
        await this.plansRepo.remove(plan);
        return { deleted: true };
    }
}


