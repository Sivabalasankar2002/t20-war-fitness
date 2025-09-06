import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../common/enums/role.enum';
import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import * as bcrypt from 'bcryptjs';

class CreateUserDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsEnum(UserRole)
    role: UserRole;
}

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    @Roles(UserRole.ADMIN)
    list(@Query('page') page?: string, @Query('limit') limit?: string) {
        return this.usersService.findAll(page ? parseInt(page, 10) : undefined, limit ? parseInt(limit, 10) : undefined);
    }

    @Post()
    @Roles(UserRole.ADMIN)
    async create(@Body() dto: CreateUserDto) {
        const passwordHash = await bcrypt.hash(dto.password, 10);
        return this.usersService.create({ email: dto.email, passwordHash, role: dto.role });
    }
}


