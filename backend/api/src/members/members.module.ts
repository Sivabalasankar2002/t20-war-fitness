import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from './member.entity';
import { MembersService } from './members.service';
import { MembersController } from './members.controller';
import { MembershipPlan } from '../membership-plans/membership-plan.entity';
import { Payment } from '../payments/payment.entity';
import { MemberPlanHistory } from './member-plan-history.entity';
import { MembershipPeriod } from './membership-period.entity';
import { EmailModule } from '../email/email.module';

@Module({
	imports: [TypeOrmModule.forFeature([Member, MembershipPlan, Payment, MemberPlanHistory, MembershipPeriod]), EmailModule],
	controllers: [MembersController],
	providers: [MembersService],
})
export class MembersModule {}


