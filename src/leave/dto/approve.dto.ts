import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class ApproveDto {
  @IsNumber()
  approvalSpecId: number;

  @IsBoolean()
  approved: boolean;

  @IsString()
  @IsOptional()
  comment?: string;
}
