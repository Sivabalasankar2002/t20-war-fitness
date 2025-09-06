import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './payment.entity';
import { Member } from '../members/member.entity';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Payment, Member])],
    controllers: [PaymentsController],
    providers: [PaymentsService],
})
export class PaymentsModule {}



