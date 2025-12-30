import { IsEnum, IsOptional, IsString } from 'class-validator';
import { LeaveStatus, LeaveType } from '../entities/leave-application.entity';

export class QueryLeaveDto {
  @IsString()
  @IsOptional()
  applicantId?: string;

  @IsEnum(LeaveStatus)
  @IsOptional()
  status?: LeaveStatus;

  @IsEnum(LeaveType)
  @IsOptional()
  leaveType?: LeaveType;

  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  endDate?: string;

  @IsOptional()
  page?: number = 1;

  @IsOptional()
  limit?: number = 10;
}