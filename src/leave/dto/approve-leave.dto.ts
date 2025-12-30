import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { LeaveStatus } from '../entities/leave-application.entity';

export class ApproveLeaveDto {
  @IsEnum(LeaveStatus)
  @IsNotEmpty()
  status: LeaveStatus;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsString()
  @IsOptional()
  approverId?: string;

  @IsString()
  @IsOptional()
  approverName?: string;
}