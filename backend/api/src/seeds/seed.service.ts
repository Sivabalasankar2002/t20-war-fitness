import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { UserRole } from '../common/enums/role.enum';
import * as bcrypt from 'bcryptjs';
import { MembershipPlan } from '../membership-plans/membership-plan.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
    private readonly logger = new Logger(SeedService.name);

    constructor(
        @InjectRepository(User) private readonly usersRepo: Repository<User>,
        @InjectRepository(MembershipPlan) private readonly plansRepo: Repository<MembershipPlan>,
    ) {}

    async onApplicationBootstrap() {
        await this.seedAdmin();
        await this.seedPlans();
    }

    private async seedAdmin() {
        const email = 'admin@t20warfitness.com';
        const existing = await this.usersRepo.findOne({ where: { email } });
        if (existing) return;
        const passwordHash = await bcrypt.hash('Admin@123', 10);
        const user = this.usersRepo.create({ email, passwordHash, role: UserRole.ADMIN });
        await this.usersRepo.save(user);
        this.logger.log('Seeded default admin user');
    }

    private async seedPlans() {
        const plans = [
            { name: 'Basic', fees: 1000, durationDays: 30, features: 'Gym access' },
            { name: 'Premium', fees: 2000, durationDays: 60, features: 'Gym + Classes' },
            { name: 'Personal Training', fees: 5000, durationDays: 30, features: 'Gym + PT' },
        ];
        for (const p of plans) {
            const exists = await this.plansRepo.findOne({ where: { name: p.name } });
            if (!exists) {
                await this.plansRepo.save(this.plansRepo.create(p));
                this.logger.log(`Seeded plan ${p.name}`);
            }
        }
    }
}


