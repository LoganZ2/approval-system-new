import { Injectable, NotFoundException } from '@nestjs/common';
import { LeaveApplication, LeaveStatus } from '../entities/leave-application.entity';
import { CreateLeaveApplicationDto } from '../dto/create-leave-application.dto';
import { ApproveLeaveDto } from '../dto/approve-leave.dto';
import { QueryLeaveDto } from '../dto/query-leave.dto';
import { MockDataService } from './mock-data.service';

@Injectable()
export class LeaveService {
  constructor(private readonly mockDataService: MockDataService) {}

  async findAll(query: QueryLeaveDto): Promise<{ data: LeaveApplication[], total: number }> {
    let applications = this.mockDataService.getAllLeaveApplications();

    // 应用过滤器
    if (query.applicantId) {
      applications = applications.filter(app => app.applicantId === query.applicantId);
    }

    if (query.status) {
      applications = applications.filter(app => app.status === query.status);
    }

    if (query.leaveType) {
      applications = applications.filter(app => app.leaveType === query.leaveType);
    }

    if (query.startDate) {
      const startDate = new Date(query.startDate);
      applications = applications.filter(app => app.startDate >= startDate);
    }

    if (query.endDate) {
      const endDate = new Date(query.endDate);
      applications = applications.filter(app => app.endDate <= endDate);
    }

    // 分页
    const page = query.page || 1;
    const limit = query.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedData = applications.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      total: applications.length
    };
  }

  async findOne(id: string): Promise<LeaveApplication> {
    const application = this.mockDataService.getLeaveApplicationById(id);
    if (!application) {
      throw new NotFoundException(`Leave application with ID ${id} not found`);
    }
    return application;
  }

  async create(createLeaveApplicationDto: CreateLeaveApplicationDto): Promise<LeaveApplication> {
    const applicationData = {
      ...createLeaveApplicationDto,
      status: LeaveStatus.PENDING,
      applicantId: createLeaveApplicationDto.applicantId || 'default-user',
      applicantName: createLeaveApplicationDto.applicantName || '默认用户'
    };

    return this.mockDataService.createLeaveApplication(applicationData);
  }


  async approve(id: string, approveLeaveDto: ApproveLeaveDto): Promise<LeaveApplication> {
    const application = await this.findOne(id);
    
    // 只有待审批状态的申请可以审批
    if (application.status !== LeaveStatus.PENDING) {
      throw new Error('只能审批待审批状态的请假申请');
    }

    const updateData = {
      status: approveLeaveDto.status,
      approvalComment: approveLeaveDto.comment,
      approverId: approveLeaveDto.approverId,
      approverName: approveLeaveDto.approverName
    };

    const updated = this.mockDataService.updateLeaveApplication(id, updateData);
    if (!updated) {
      throw new NotFoundException(`Leave application with ID ${id} not found`);
    }
    return updated;
  }

  async getPendingApplications(): Promise<LeaveApplication[]> {
    return this.mockDataService.getPendingApplications();
  }

  async getApplicationsByApplicant(applicantId: string): Promise<LeaveApplication[]> {
    return this.mockDataService.getLeaveApplicationsByApplicant(applicantId);
  }

  async getLeaveStatistics(applicantId?: string): Promise<{
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    byType: Record<string, number>;
  }> {
    let applications = this.mockDataService.getAllLeaveApplications();
    
    if (applicantId) {
      applications = applications.filter(app => app.applicantId === applicantId);
    }

    const byType: Record<string, number> = {};
    applications.forEach(app => {
      byType[app.leaveType] = (byType[app.leaveType] || 0) + app.duration;
    });

    return {
      total: applications.length,
      approved: applications.filter(app => app.status === LeaveStatus.APPROVED).length,
      pending: applications.filter(app => app.status === LeaveStatus.PENDING).length,
      rejected: applications.filter(app => app.status === LeaveStatus.REJECTED).length,
      byType
    };
  }
}