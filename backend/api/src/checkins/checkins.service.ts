import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Checkin } from './checkin.entity';
import { Member } from '../members/member.entity';

@Injectable()
export class CheckinsService {
    constructor(
        @InjectRepository(Checkin) private readonly checkinsRepo: Repository<Checkin>,
        @InjectRepository(Member) private readonly membersRepo: Repository<Member>,
    ) {}

    async checkIn(memberId: string): Promise<Checkin> {
        const member = await this.membersRepo.findOne({ where: { id: memberId } });
        if (!member) throw new NotFoundException('Member not found');

        const open = await this.checkinsRepo.findOne({ where: { member: { id: memberId }, checkoutAt: IsNull() } });
        if (open) throw new BadRequestException('Member already checked in');

        const checkin = this.checkinsRepo.create({ member, checkinAt: new Date() });
        return this.checkinsRepo.save(checkin);
    }

    async checkOut(memberId: string): Promise<Checkin> {
        const member = await this.membersRepo.findOne({ where: { id: memberId } });
        if (!member) throw new NotFoundException('Member not found');

        const open = await this.checkinsRepo.findOne({ where: { member: { id: memberId }, checkoutAt: IsNull() } });
        if (!open) throw new BadRequestException('No open check-in found');

        open.checkoutAt = new Date();
        return this.checkinsRepo.save(open);
    }

    async history(memberId: string) {
        const member = await this.membersRepo.findOne({ where: { id: memberId } });
        if (!member) throw new NotFoundException('Member not found');
        return this.checkinsRepo.find({ where: { member: { id: memberId } }, order: { checkinAt: 'DESC' } });
    }
}



