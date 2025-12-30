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
import { CreateLeaveApplicationDto } from '../dto/create-leave-application.dto';
import { ApproveLeaveDto } from '../dto/approve-leave.dto';
import { QueryLeaveDto } from '../dto/query-leave.dto';
import { LeaveApplication } from '../entities/leave-application.entity';

@Controller('leave')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Get()
  async findAll(@Query() query: QueryLeaveDto): Promise<{ 
    data: LeaveApplication[], 
    total: number,
    page: number,
    limit: number 
  }> {
    const result = await this.leaveService.findAll(query);
    return {
      ...result,
      page: query.page || 1,
      limit: query.limit || 10
    };
  }

  @Get('pending')
  async findPending(): Promise<LeaveApplication[]> {
    return this.leaveService.getPendingApplications();
  }

  @Get('applicant/:applicantId')
  async findByApplicant(@Param('applicantId') applicantId: string): Promise<LeaveApplication[]> {
    return this.leaveService.getApplicationsByApplicant(applicantId);
  }

  @Get('statistics')
  async getStatistics(@Query('applicantId') applicantId?: string): Promise<{
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    byType: Record<string, number>;
  }> {
    return this.leaveService.getLeaveStatistics(applicantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<LeaveApplication> {
    return this.leaveService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createLeaveApplicationDto: CreateLeaveApplicationDto): Promise<LeaveApplication> {
    return this.leaveService.create(createLeaveApplicationDto);
  }

  @Post(':id/approve')
  async approve(
    @Param('id') id: string,
    @Body() approveLeaveDto: ApproveLeaveDto
  ): Promise<LeaveApplication> {
    return this.leaveService.approve(id, approveLeaveDto);
  }
}