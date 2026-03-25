import { IsNumber } from 'class-validator';

export class WithdrawApplicationDto {
  @IsNumber()
  applicationId: number;
}
