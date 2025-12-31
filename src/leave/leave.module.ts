import { Module } from '@nestjs/common';
import { LeaveController } from './controllers/leave.controller';
import { LeaveService } from './services/leave.service';

@Module({
  controllers: [LeaveController],
  providers: [LeaveService],
})
export class LeaveModule {}