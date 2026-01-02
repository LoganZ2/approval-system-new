import { IsDate, IsEnum, IsNumber, IsObject, IsString } from "class-validator";

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

export class Application {
  @IsNumber()
  id: Number;
  @IsEnum(LeaveType)
  type: LeaveType;
  @IsNumber()
  duration: Number;
  @IsEnum(LeaveStatus)
  status: LeaveStatus;
	@IsDate()
  startDate: Date;
	@IsEnum(DayHalf)
  startHalf: DayHalf;
	@IsDate()
  endDate: Date;
	@IsEnum(DayHalf)
  endHalf: DayHalf;
	@IsString()
  reason: String;
	@IsDate()
  createdAt: Date;
	@IsDate()
  updatedAt: Date;
}


export class PendingApproval {
	@IsNumber()
  id: Number;
	@IsString()
  applicantName: String;
	@IsEnum(LeaveType)
  type: LeaveType;
	@IsString()
  reason: String;
	@IsDate()
  startDate: Date;
	@IsEnum(DayHalf)
  startHalf: DayHalf;
	@IsDate()
  endDate: Date;
	@IsEnum(DayHalf)
  endHalf: DayHalf;
}