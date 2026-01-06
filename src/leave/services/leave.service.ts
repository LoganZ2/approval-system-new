import { Injectable } from '@nestjs/common';
import { Application, ApprovalType, ApproveInfo, DayHalf, LeaveStatus, LeaveType, Level, PendingApproval, User } from '../types';
import { query, transaction } from 'src/database';
import { ResultSetHeader } from 'mysql2/promise';

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
				value.duration = calculateDuration(value.startDate, value.startHalf, value.endDate, value.endHalf)
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

	async apply(openid: string, application: Application) {
		let [user] = (await query<User>("SELECT * FROM user WHERE openid=?", [openid]));
		console.log(Level.DepartmentManager)
		let approvers = (await query<User>("SELECT id FROM user WHERE department=? AND level=?", [user.department, Level.DepartmentManager]));
		let managers = (await query<User>("SELECT id FROM user WHERE level=?", [Level.Manager]))
		
		return await transaction(async (connection) => {

			if (user.level === Level.Employee) {
				let [applicationResult] = await connection.execute<ResultSetHeader>(
					`INSERT INTO application (user_id, start_date, start_half, end_date, end_half, reason, type)
					VALUES (?, ?, ?, ?, ?, ?, ?)`, 
					[user.id, application.startDate, application.startHalf, application.endDate, application.endHalf, application.reason, application.type]
				);
				let [approvalResult] = await connection.execute<ResultSetHeader>(
					`INSERT INTO approval (application_id, step, type)
					VALUES (?, ?, ?)`,
					[applicationResult.insertId, 1, ApprovalType.OR]
				);
				let ids = approvers.map(item => [
					approvalResult.insertId,
					item.id
				])
				await connection.query(
					`INSERT INTO approval_spec (approval_id, approver_id)
					VALUES ?`, [ids]
				)

				if (calculateDuration(application.startDate, application.startHalf, application.endDate, application.endHalf) >= 2) {
					approvalResult = (await connection.execute<ResultSetHeader>(
						`INSERT INTO approval (application_id, step, type)
						VALUES (?, ?, ?)`,
						[applicationResult.insertId, 2, ApprovalType.OR]
					))[0];
					console.log(approvalResult)
					ids = managers.map(item => [
						approvalResult.insertId,
						item.id
					])
					await connection.query(
						`INSERT INTO approval_spec (approval_id, approver_id)
						VALUES ?`, [ids]
					)
				}
			} else if (user.level === Level.DepartmentManager) {
				let [applicationResult] = await connection.execute<ResultSetHeader>(
					`INSERT INTO application (user_id, start_date, start_half, end_date, end_half, reason, type)
					VALUES (?, ?, ?, ?, ?, ?, ?)`, 
					[user.id, application.startDate, application.startHalf, application.endDate, application.endHalf, application.reason, application.type]
				);
				let [approvalResult] = await connection.execute<ResultSetHeader>(
					`INSERT INTO approval (application_id, step, type)
					VALUES (?, ?, ?)`,
					[applicationResult.insertId, 1, ApprovalType.OR]
				);
				let ids = managers.map(item => [
					approvalResult.insertId,
					item.id
				])
				await connection.query(
					`INSERT INTO approval_spec (approval_id, approver_id)
					VALUES ?`, [ids]
				)
			}


		})
	}

	// TODO!!!
	async approve(openid: string, approveInfo: ApproveInfo) {
		let [user] = (await query<User>("SELECT * FROM user WHERE openid=?", [openid]));
		const status = approveInfo.approved ? LeaveStatus.APPROVED : LeaveStatus.REJECTED
		return await transaction(async (connection) => {
			await connection.execute(`UPDATE approval_spec
				SET 
					status=?,
					comment=?
				WHERE id=?`, [status, approveInfo.comment, approveInfo.approvalSpecId])

			if (approveInfo.approved) {
				let approvalId = (await connection.execute(`
					SELECT approval_id 
						FROM approval_spec 
						WHERE id = ?`, [approveInfo.approvalSpecId]))[0][0].approval_id;
				let approvalType = (await connection.execute("SELECT type FROM approval WHERE id=?", [approvalId]))[0][0].type;
				if (approvalType === ApprovalType.And) {
					// check if other spec are approved, if all approved then UPDATE approval
				} else if (approvalType === ApprovalType.OR) {
					// UPDATE approval to approved
				}
			}

			let specStatusList = (await connection.execute(`
				SELECT status 
				FROM approval_spec 
				WHERE approval_id = (
					SELECT approval_id 
					FROM approval_spec 
					WHERE id = ?
				);`, [approveInfo.approvalSpecId]))

				

			})



	}
}

function calculateDuration(startDate, startHalf, endDate, endHalf) {
		let duration = 0;
		if (endHalf === DayHalf.AM) {
			duration += 0.5;
		} else if (endHalf === DayHalf.PM) {
			duration += 1;
		}
		if (startHalf === DayHalf.PM) {
			duration -= 0.5;
		}
		const d1 = new Date(endDate);
		const d2 = new Date(startDate)
		d1.setHours(0, 0, 0, 0);
		d2.setHours(0, 0, 0, 0);
		const diffTime = Math.abs(d1.getTime() - d2.getTime());
		const diffDays = diffTime / (1000 * 60 * 60 * 24);
		duration = duration + diffDays;
		return duration;
}