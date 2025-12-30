import { Module } from '@nestjs/common';
import { LeaveController } from './controllers/leave.controller';
import { LeaveService } from './services/leave.service';
import { MockDataService } from './services/mock-data.service';

@Module({
  controllers: [LeaveController],
  providers: [LeaveService, MockDataService],
})
export class LeaveModule {}