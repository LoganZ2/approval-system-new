import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

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
  CANCELLED = 'cancelled',
}

export enum ApprovalType {
  And = 'and',
  OR = 'or',
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
  @IsNumber()
  @IsOptional()
  currentStep: number;
  @IsNumber()
  @IsOptional()
  totalSteps: number;
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
  applicationId: number;
  @IsNumber()
  step: number;
  @IsEnum(ApprovalType)
  type: ApprovalType;
  @IsEnum(LeaveStatus)
  @IsOptional()
  status: LeaveStatus;
}

export class PendingApproval {
  @IsNumber()
  id: number;
  @IsNumber()
  applicationId: number;
  @IsString()
  applicant: string;
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
  @IsNumber()
  duration: number;
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

export class ApplicationListItem {
  id: number;
  applicantName: string;
  type: LeaveType;
  status: LeaveStatus;
  startDate: Date;
  startHalf: DayHalf;
  endDate: Date;
  endHalf: DayHalf;
  duration: number;
}

export enum Level {
  Employee = 'employee',
  DepartmentManager = 'department_manager',
  Manager = 'manager',
}

export class User {
  @IsNumber()
  @IsOptional()
  id?: number;
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

export class ApprovalSpecResponseDto {
  @IsNumber()
  id: number;

  @IsNumber()
  approverId: number;

  @IsString()
  approverName: string;

  @IsEnum(LeaveStatus)
  status: LeaveStatus;

  @IsString()
  @IsOptional()
  comment?: string;
}

// Approval DTO
export class ApprovalResponseDto {
  @IsNumber()
  id: number;

  @IsNumber()
  step: number;

  @IsEnum(ApprovalType)
  type: ApprovalType;

  @IsEnum(LeaveStatus)
  status: LeaveStatus;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApprovalSpecResponseDto)
  approvalSpecList: ApprovalSpecResponseDto[];
}

// 主 Application DTO
export class ApplicationResponseDto {
  @IsNumber()
  id: number;

  @IsNumber()
  applicantId: number;

  @IsString()
  name: string;

  @IsDate()
  startDate: Date;

  @IsEnum(DayHalf)
  startHalf: DayHalf;

  @IsDate()
  endDate: Date;

  @IsEnum(DayHalf)
  endHalf: DayHalf;

  @IsNumber()
  duration: number;

  @IsString()
  reason: string;

  @IsEnum(LeaveStatus)
  status: LeaveStatus;

  @IsNumber()
  currentStep: number;

  @IsNumber()
  totalSteps: number;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApprovalResponseDto)
  approvalList: ApprovalResponseDto[];
}
