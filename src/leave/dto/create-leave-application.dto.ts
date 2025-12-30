import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { LeaveType } from '../entities/leave-application.entity';

export class CreateLeaveApplicationDto {
  @IsEnum(LeaveType)
  @IsNotEmpty()
  leaveType: LeaveType;

  @IsNotEmpty()
  startDate: Date;

  @IsNotEmpty()
  endDate: Date;

  @IsNumber()
  @Min(0.5)
  duration: number;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsString()
  @IsOptional()
  applicantId?: string;

  @IsString()
  @IsOptional()
  applicantName?: string;
}