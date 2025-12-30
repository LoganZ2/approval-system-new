import { Injectable } from '@nestjs/common';
import { LeaveApplication, LeaveStatus, LeaveType } from '../entities/leave-application.entity';

@Injectable()
export class MockDataService {
  private leaveApplications: LeaveApplication[] = [
    {
      id: '1',
      applicantId: 'user001',
      applicantName: '张三',
      leaveType: LeaveType.ANNUAL,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-02'),
      duration: 2,
      reason: '春节回家探亲',
      status: LeaveStatus.APPROVED,
      approverId: 'admin001',
      approverName: '李经理',
      approvalComment: '批准',
      createdAt: new Date('2024-12-28'),
      updatedAt: new Date('2024-12-29')
    },
    {
      id: '2',
      applicantId: 'user002',
      applicantName: '李四',
      leaveType: LeaveType.SICK,
      startDate: new Date('2025-01-03'),
      endDate: new Date('2025-01-03'),
      duration: 1,
      reason: '感冒发烧',
      status: LeaveStatus.PENDING,
      createdAt: new Date('2024-12-30'),
      updatedAt: new Date('2024-12-30')
    },
    {
      id: '3',
      applicantId: 'user003',
      applicantName: '王五',
      leaveType: LeaveType.PERSONAL,
      startDate: new Date('2025-01-05'),
      endDate: new Date('2025-01-05'),
      duration: 0.5,
      reason: '办理个人事务',
      status: LeaveStatus.REJECTED,
      approverId: 'admin001',
      approverName: '李经理',
      approvalComment: '理由不充分',
      createdAt: new Date('2024-12-27'),
      updatedAt: new Date('2024-12-28')
    },
    {
      id: '4',
      applicantId: 'user001',
      applicantName: '张三',
      leaveType: LeaveType.MARRIAGE,
      startDate: new Date('2025-02-14'),
      endDate: new Date('2025-02-16'),
      duration: 3,
      reason: '结婚休假',
      status: LeaveStatus.PENDING,
      createdAt: new Date('2024-12-29'),
      updatedAt: new Date('2024-12-29')
    }
  ];

  private idCounter = 5;

  getAllLeaveApplications(): LeaveApplication[] {
    return this.leaveApplications;
  }

  getLeaveApplicationById(id: string): LeaveApplication | undefined {
    return this.leaveApplications.find(app => app.id === id);
  }

  createLeaveApplication(data: Omit<LeaveApplication, 'id' | 'createdAt' | 'updatedAt'>): LeaveApplication {
    const newApplication: LeaveApplication = {
      ...data,
      id: (this.idCounter++).toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.leaveApplications.push(newApplication);
    return newApplication;
  }

  updateLeaveApplication(id: string, data: Partial<LeaveApplication>): LeaveApplication | undefined {
    const index = this.leaveApplications.findIndex(app => app.id === id);
    if (index === -1) return undefined;

    this.leaveApplications[index] = {
      ...this.leaveApplications[index],
      ...data,
      updatedAt: new Date()
    };
    return this.leaveApplications[index];
  }

  deleteLeaveApplication(id: string): boolean {
    const index = this.leaveApplications.findIndex(app => app.id === id);
    if (index === -1) return false;
    
    this.leaveApplications.splice(index, 1);
    return true;
  }

  getLeaveApplicationsByApplicant(applicantId: string): LeaveApplication[] {
    return this.leaveApplications.filter(app => app.applicantId === applicantId);
  }

  getPendingApplications(): LeaveApplication[] {
    return this.leaveApplications.filter(app => app.status === LeaveStatus.PENDING);
  }
}