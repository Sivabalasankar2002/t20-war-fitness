import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { MembershipPlan } from '../membership-plans/membership-plan.entity';
import { SeedService } from './seed.service';

@Module({
    imports: [TypeOrmModule.forFeature([User, MembershipPlan])],
    providers: [SeedService],
    exports: [SeedService],
})
export class SeedModule {}


