import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembershipPlan } from './membership-plan.entity';
import { MembershipPlansService } from './membership-plans.service';
import { MembershipPlansController } from './membership-plans.controller';

@Module({
	imports: [TypeOrmModule.forFeature([MembershipPlan])],
	controllers: [MembershipPlansController],
	providers: [MembershipPlansService],
	exports: [TypeOrmModule],
})
export class MembershipPlansModule {}


