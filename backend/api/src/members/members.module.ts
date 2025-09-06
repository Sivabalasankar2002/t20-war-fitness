import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from './member.entity';
import { MembersService } from './members.service';
import { MembersController } from './members.controller';
import { MembershipPlan } from '../membership-plans/membership-plan.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Member, MembershipPlan])],
	controllers: [MembersController],
	providers: [MembersService],
})
export class MembersModule {}


