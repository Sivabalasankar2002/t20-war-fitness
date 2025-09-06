import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from '../members/member.entity';
import { Payment } from '../payments/payment.entity';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Member, Payment])],
    controllers: [DashboardController],
    providers: [DashboardService],
})
export class DashboardModule {}


