import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsString, MinLength } from 'class-validator';
import { DayHalf, LeaveType } from '../types';

export class ApplyLeaveDto {
  @IsEnum(LeaveType)
  type: LeaveType;

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
}
