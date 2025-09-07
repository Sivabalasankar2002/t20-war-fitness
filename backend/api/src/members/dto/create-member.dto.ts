import { IsDateString, IsEmail, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Matches } from 'class-validator';
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
	@Matches(/^(\+91|91)?[6-9]\d{9}$/, { message: 'Phone number must be a valid Indian mobile number' })
	phone?: string;

	@IsOptional()
	@IsEmail({}, { message: 'Email must be a valid email address' })
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


