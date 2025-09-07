import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembershipPlan } from './membership-plan.entity';
import { MembershipPlansService } from './membership-plans.service';
import { MembershipPlansController } from './membership-plans.controller';
import { Member } from '../members/member.entity';
import { MembershipPeriod } from '../members/membership-period.entity';

@Module({
	imports: [TypeOrmModule.forFeature([MembershipPlan, Member, MembershipPeriod])],
	controllers: [MembershipPlansController],
	providers: [MembershipPlansService],
	exports: [TypeOrmModule],
})
export class MembershipPlansModule {}


