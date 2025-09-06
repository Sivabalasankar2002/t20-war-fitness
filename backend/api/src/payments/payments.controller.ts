import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../common/enums/role.enum';
import { IsDateString, IsNumber, IsPositive } from 'class-validator';

class RecordPaymentDto {
    @IsNumber()
    @IsPositive()
    amount: number;

    @IsDateString()
    paidOn: string;
}

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) {}

    @Post(':memberId')
    @Roles(UserRole.ADMIN, UserRole.GYM_MANAGER)
    record(@Param('memberId') memberId: string, @Body() dto: RecordPaymentDto) {
        return this.paymentsService.record(memberId, dto.amount, dto.paidOn);
    }

    @Get(':memberId')
    @Roles(UserRole.ADMIN, UserRole.GYM_MANAGER, UserRole.MEMBER)
    list(
        @Param('memberId') memberId: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.paymentsService.listForMember(memberId, page ? parseInt(page, 10) : undefined, limit ? parseInt(limit, 10) : undefined);
    }
}



