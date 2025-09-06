import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MembershipPlan } from './membership-plan.entity';

@Injectable()
export class MembershipPlansService {
    constructor(
        @InjectRepository(MembershipPlan)
        private readonly plansRepo: Repository<MembershipPlan>,
    ) {}

    create(data: Pick<MembershipPlan, 'name' | 'fees' | 'durationDays' | 'features'>) {
        const plan = this.plansRepo.create(data);
        return this.plansRepo.save(plan);
    }

    findAll() {
        return this.plansRepo.find({ order: { createdAt: 'DESC' } });
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
        await this.plansRepo.remove(plan);
        return { deleted: true };
    }
}


