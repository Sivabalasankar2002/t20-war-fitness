import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Checkin } from './checkin.entity';
import { Member } from '../members/member.entity';
import { CheckinsService } from './checkins.service';
import { CheckinsController } from './checkins.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Checkin, Member])],
    controllers: [CheckinsController],
    providers: [CheckinsService],
})
export class CheckinsModule {}



