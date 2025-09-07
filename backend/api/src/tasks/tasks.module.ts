import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from '../members/member.entity';
import { MembershipPeriod } from '../members/membership-period.entity';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Member, MembershipPeriod]),
  ],
  providers: [TasksService],
  controllers: [TasksController],
})
export class TasksModule {}
