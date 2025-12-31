import { Injectable } from '@nestjs/common';
import { Application, PendingApproval } from '../types';
import { query } from 'src/database';

@Injectable()
export class LeaveService {
  constructor() {}

  async selectApplicationByUserId(userId: Number): Promise<Application[]> {
      const rows = await query<Application>(
          `SELECT 
              id, 
              user_id AS userId, 
              start_date as startDate, 
              start_half as startHalf, 
              end_date as endDate, 
              reason, 
              type, 
              created_at as createdAt, 
              updated_at as updatedAt 
          FROM application WHERE user_id=? AND is_deleted=0`,
          [userId]
      )
      return rows;
  }

  async selectPendingApprovalByUserId(userId): Promise<PendingApproval[]> {
      const sql = `
          SELECT 
              aps.id AS id,
              u.name AS applicantName,
              app.type,
              app.reason,
              app.start_date AS startDate,
              app.start_half AS startHalf,
              app.end_date as endDate,
              app.end_half as endHalf
          FROM approval_spec aps
          LEFT JOIN approval ap ON aps.approval_id = ap.id
          LEFT JOIN application app ON ap.application_id = app.id
          LEFT JOIN user u ON app.user_id = u.id
          WHERE aps.approver_id = ? 
            AND aps.status = 'pending'
      `;

      const rows: PendingApproval[] = await query<PendingApproval>(sql, [userId]);
      return rows;
  }
}