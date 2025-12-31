import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { LeaveService } from '../services/leave.service';
import { Application, PendingApproval } from '../types';

@Controller('leave')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Get("/applications")
  async selectApplicationByUserId(@Query("userId") userId: Number): Promise<Application[]> {
    const result = await this.leaveService.selectApplicationByUserId(userId);
    return result;
  }

  @Get("/pending-approvals")
  async selectPendingApprovalByUserId(@Query("userId") userId: Number): Promise<PendingApproval[]> {
    const result = await this.leaveService.selectPendingApprovalByUserId(userId);
    return result;
  }
}