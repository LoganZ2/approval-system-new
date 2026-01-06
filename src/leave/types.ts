import { Type } from "class-transformer";
import { IsBoolean, IsDate, IsEnum, IsNumber, IsObject, IsOptional, IsString } from "class-validator";


export enum DayHalf {
  AM = 'am',
  PM = 'pm',
}

export enum LeaveType {
  ANNUAL = 'annual',
  SICK = 'sick',
  PERSONAL = 'personal',
  MARRIAGE = 'marriage',
  MATERNITY = 'maternity',
  FUNERAL = 'funeral',
}

export enum LeaveStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}

export enum ApprovalType {
  And='and',
  OR='or'
}

export class Application {
  @IsNumber()
  @IsOptional()
  id: number;
  @IsEnum(LeaveType)
  type: LeaveType;
  @IsNumber()
  @IsOptional()
  duration: number;
  @IsEnum(LeaveStatus)
  @IsOptional()
  status: LeaveStatus;
	@IsDate()
  @Type(() => Date)
  startDate: Date;
	@IsEnum(DayHalf)
  startHalf: DayHalf;
	@IsDate()
  @Type(() => Date)
  endDate: Date;
	@IsEnum(DayHalf)
  endHalf: DayHalf;
	@IsString()
  reason: string;
	@IsDate()
  @Type(() => Date)
  @IsOptional()
  createdAt: Date;
	@IsDate()
  @Type(() => Date)
  @IsOptional()
  updatedAt: Date;
}

export class Approval {
  @IsNumber()
  @IsOptional()
  id: number;
  @IsNumber()
  application_id: number;
  @IsNumber()
  step: number;
  @IsEnum(LeaveStatus)
  @IsOptional()
  status: LeaveStatus;
}


export class PendingApproval {
	@IsNumber()
  id: number;
	@IsString()
  applicantName: String;
	@IsEnum(LeaveType)
  type: LeaveType;
	@IsString()
  reason: string;
	@IsDate()
  @Type(() => Date)
  startDate: Date;
	@IsEnum(DayHalf)
  startHalf: DayHalf;
	@IsDate()
  @Type(() => Date)
  endDate: Date;
	@IsEnum(DayHalf)
  endHalf: DayHalf;
}

export class ApproveInfo {
  @IsNumber()
  approvalSpecId: number;
  @IsBoolean()
  approved: boolean;
  @IsString()
  @IsOptional()
  comment: string | null;
}

export enum Level {
  Employee="employee",
  DepartmentManager="department_manager",
  Manager="manager"
}

export class User {
  @IsNumber()
  @IsOptional()
  id: number | null;
  @IsString()
  name: string;
  @IsString()
  department: string;
  @IsEnum(Level)
  level: Level;
  @IsString()
  @IsOptional()
  openid: string;
}