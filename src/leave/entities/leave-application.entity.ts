export enum LeaveType {
  ANNUAL = 'annual', // 年假
  SICK = 'sick', // 病假
  PERSONAL = 'personal', // 事假
  MARRIAGE = 'marriage', // 婚假
  MATERNITY = 'maternity', // 产假
  PATERNITY = 'paternity', // 陪产假
  OTHER = 'other' // 其他
}

export enum LeaveStatus {
  PENDING = 'pending', // 待审批
  APPROVED = 'approved', // 已批准
  REJECTED = 'rejected', // 已拒绝
  CANCELLED = 'cancelled' // 已取消
}

export class LeaveApplication {
  id: string;
  applicantId: string; // 申请人ID
  applicantName: string; // 申请人姓名
  leaveType: LeaveType; // 请假类型
  startDate: Date; // 开始日期
  endDate: Date; // 结束日期
  duration: number; // 请假时长（半天为单位）
  reason: string; // 请假事由
  status: LeaveStatus; // 审批状态
  approverId?: string; // 审批人ID
  approverName?: string; // 审批人姓名
  approvalComment?: string; // 审批意见
  createdAt: Date; // 创建时间
  updatedAt: Date; // 更新时间

  constructor(partial: Partial<LeaveApplication>) {
    Object.assign(this, partial);
  }
}