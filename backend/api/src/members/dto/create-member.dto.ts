import { IsDateString, IsEmail, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { MemberStatus } from '../member.entity';

export class CreateMemberDto {
	@IsString()
	@IsNotEmpty()
	name: string;

	@IsInt()
	@IsPositive()
	age: number;

	@IsOptional()
	@IsString()
	phone?: string;

	@IsOptional()
	@IsEmail()
	email?: string;

	@IsDateString()
	startDate: string;

	@IsDateString()
	endDate: string;

	@IsOptional()
	@IsEnum(MemberStatus)
	status?: MemberStatus;

	@IsOptional()
	@IsInt()
	balanceDays?: number;

	@IsOptional()
	@IsNumber()
	feesPaid?: number;

	@IsString()
	@IsNotEmpty()
	membershipPlanId: string;
}


