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
import { post, request } from 'axios';
import * as cloud from "wx-server-sdk";



@Controller('leave')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {
    cloud.init({
      env: 'prod-0gov9rdc5eed3c97',
      traceUser: true
    })
  }

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



  @Get("/test-send")
  async testSend() {
    const context = cloud.getWXContext()
    return JSON.stringify(context)
  }
}