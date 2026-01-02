import { Injectable } from '@nestjs/common';
import { Application, DayHalf, PendingApproval } from '../types';
import { query } from 'src/database';

@Injectable()
export class LeaveService {
  constructor() {}

  async selectApplicationByUserId(userId: Number): Promise<Application[]> {
      let rows = await query<Application>(
          `SELECT 
							id,
              type, 
              status,
              start_date as startDate, 
              start_half as startHalf, 
              end_date as endDate, 
              end_half as endHalf,
              reason, 
              created_at as createdAt, 
              updated_at as updatedAt 
          FROM application WHERE user_id=? AND is_deleted=0`,
          [userId]
      )
      rows.forEach(value => {
				let duration = 0;
				if (value.endHalf === DayHalf.AM) {
					duration += 0.5;
				} else if (value.endHalf === DayHalf.PM) {
					duration += 1;
				}
				if (value.startHalf === DayHalf.PM) {
					duration -= 0.5;
				}
				const d1 = new Date(value.endDate);
				const d2 = new Date(value.startDate)
				d1.setHours(0, 0, 0, 0);
  			d2.setHours(0, 0, 0, 0);
				const diffTime = Math.abs(d1.getTime() - d2.getTime());
				const diffDays = diffTime / (1000 * 60 * 60 * 24);
				value.duration = duration + diffDays;
			})
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