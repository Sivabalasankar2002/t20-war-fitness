import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { MembershipPlansService } from './membership-plans.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../common/enums/role.enum';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('plans')
export class MembershipPlansController {
    constructor(private readonly plansService: MembershipPlansService) {}

    @Get()
    @Roles(UserRole.ADMIN, UserRole.GYM_MANAGER)
    findAll(@Query('includeInactive') includeInactive?: string) {
        const showInactive = includeInactive === 'true';
        return this.plansService.findAll(showInactive);
    }

    @Get(':id')
    @Roles(UserRole.ADMIN, UserRole.GYM_MANAGER)
    findOne(@Param('id') id: string) {
        return this.plansService.findOne(id);
    }

    @Post()
    @Roles(UserRole.ADMIN)
    create(@Body() body: { name: string; fees: number; durationDays: number; features?: string }) {
        return this.plansService.create(body);
    }

    @Put(':id')
    @Roles(UserRole.ADMIN)
    update(@Param('id') id: string, @Body() body: { name?: string; fees?: number; durationDays?: number; features?: string }) {
        return this.plansService.update(id, body);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    remove(@Param('id') id: string) {
        return this.plansService.remove(id);
    }
}


