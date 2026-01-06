import { Module } from '@nestjs/common';
import { LeaveController } from './controllers/leave.controller';
import { LeaveService } from './services/leave.service';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';

@Module({
  controllers: [LeaveController, UserController],
  providers: [LeaveService, UserService],
})
export class LeaveModule {}