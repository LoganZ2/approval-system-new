import { BadRequestException, Injectable } from '@nestjs/common';
import {
  Application,
  ApplicationListItem,
  ApplicationResponseDto,
  Approval,
  ApprovalResponseDto,
  ApprovalSpecResponseDto,
  ApprovalType,
  DayHalf,
  LeaveStatus,
  Level,
  PendingApproval,
  User,
} from '../types';
import { ApplyLeaveDto } from '../dto/apply-leave.dto';
import { ApproveDto } from '../dto/approve.dto';
import { query, transaction } from 'src/database';
import { ResultSetHeader } from 'mysql2/promise';

@Injectable()
export class LeaveService {
  constructor() {}

  async selectApplicationByOpenid(openid: string): Promise<Application[]> {
    const rows = await query<Application>(
      `SELECT 
					id,
					type, 
					status,
					start_date as startDate, 
					start_half as startHalf, 
					current_step as currentStep,
					total_steps as totalSteps,
					end_date as endDate, 
					end_half as endHalf,
					reason, 
					created_at as createdAt, 
					updated_at as updatedAt 
			FROM application WHERE user_id=(
				SELECT id FROM user WHERE openid=?
			) AND is_deleted=0`,
      [openid],
    );
    rows.forEach((value) => {
      value.duration = calculateDuration(
        value.startDate,
        value.startHalf,
        value.endDate,
        value.endHalf,
      );
    });
    return rows;
  }

  async selectPendingApprovalByOpenid(openid): Promise<PendingApproval[]> {
    const sql = `
				SELECT 
					aps.id AS id,
					app.id AS applicationId,
					u.name AS applicant,
					ldh.leave_days AS leaveDays,
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
				LEFT JOIN user approver ON aps.approver_id = approver.id
				LEFT JOIN leave_duration_history ldh ON app.user_id = ldh.user_id AND ldh.year = YEAR(NOW())
				WHERE approver.openid = ?
					AND app.status = 'pending'
					AND aps.status = 'pending'
					AND app.current_step = ap.step
					AND app.is_deleted = 0
      `;
    const rows: PendingApproval[] = await query<PendingApproval>(sql, [openid]);
    for (const item of rows) {
      item.duration = calculateDuration(
        item.startDate,
        item.startHalf,
        item.endDate,
        item.endHalf,
      );
			if (item.leaveDays === null) {
				item.leaveDays = 0;
			}
    }
    return rows;
  }

  async applicationDetails(id: number) {
    const [application] = await query<ApplicationResponseDto>(
      `
			SELECT 
				app.id AS id,
				user.id AS applicantId,
				user.name AS name,
				app.start_date AS startDate,
				app.start_half AS startHalf,
				app.status AS status,
				app.type AS type,
				app.end_date AS endDate,
				app.end_half AS endHalf,
				app.reason AS reason,
				app.current_step AS currentStep,
				app.total_steps AS totalSteps,
				app.created_at AS createdAt,
				app.updated_at AS updatedAt,
				ldh.leave_days AS leaveDays
			FROM application app
			LEFT JOIN user ON user.id=app.user_id
			LEFT JOIN leave_duration_history ldh ON app.user_id = ldh.user_id AND ldh.year = YEAR(NOW())
			WHERE app.id=?
				AND app.is_deleted=0
		`,
      [id],
    );
    application.duration = calculateDuration(
      application.startDate,
      application.startHalf,
      application.endDate,
      application.endHalf,
    );
    const appId = application.id;
    const approvalList = await query<ApprovalResponseDto>(
      'SELECT id, step, type, status FROM approval WHERE application_id=? ORDER BY step',
      [appId],
    );
    for (const approval of approvalList) {
      const approvalSpecList = await query<ApprovalSpecResponseDto>(
        `
				SELECT 
					aps.id AS id,
					user.id AS approverId,
					user.name AS approverName,
					aps.status AS status,
					aps.comment AS comment
				FROM approval_spec aps
				LEFT JOIN user ON user.id=aps.approver_id
				WHERE approval_id=?`,
        [approval.id],
      );
      approval.approvalSpecList = approvalSpecList;
    }
    application.approvalList = approvalList;
		if (application.leaveDays === null) {
			application.leaveDays = 0;
		}
    return application;
  }

  async apply(openid: string, application: ApplyLeaveDto) {
    const [user] = await query<User>('SELECT * FROM user WHERE openid=?', [
      openid,
    ]);
    const approvers = await query<User>(
      'SELECT id FROM user WHERE department=? AND level IN (?, ?)',
      [user.department, Level.DepartmentManager, Level.DeputyManager],
    );
    const managers = await query<User>('SELECT id FROM user WHERE level=?', [
      Level.Manager,
    ]);

    return await transaction(async (connection) => {
      if (user.level === Level.Employee && approvers.length > 0) {
        const [applicationResult] = await connection.execute<ResultSetHeader>(
          `INSERT INTO application (user_id, start_date, start_half, end_date, end_half, reason, type, total_steps)
					VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
          [
            user.id,
            application.startDate,
            application.startHalf,
            application.endDate,
            application.endHalf,
            application.reason,
            application.type,
          ],
        );
        let [approvalResult] = await connection.execute<ResultSetHeader>(
          `INSERT INTO approval (application_id, step, type)
					VALUES (?, ?, ?)`,
          [applicationResult.insertId, 1, ApprovalType.OR],
        );
        let ids = approvers.map((item) => [approvalResult.insertId, item.id]);
        await connection.query(
          `INSERT INTO approval_spec (approval_id, approver_id)
					VALUES ?`,
          [ids],
        );

        if (
          calculateDuration(
            application.startDate,
            application.startHalf,
            application.endDate,
            application.endHalf,
          ) >= 2
        ) {
          approvalResult = (
            await connection.execute<ResultSetHeader>(
              `INSERT INTO approval (application_id, step, type)
						VALUES (?, ?, ?)`,
              [applicationResult.insertId, 2, ApprovalType.OR],
            )
          )[0];
          console.log(approvalResult);
          ids = managers.map((item) => [approvalResult.insertId, item.id]);
          await connection.query(
            `INSERT INTO approval_spec (approval_id, approver_id)
						VALUES ?`,
            [ids],
          );
          await connection.execute(
            'UPDATE application SET total_steps=2 WHERE id=?',
            [applicationResult.insertId],
          );
        }
      } else if (user.level === Level.DepartmentManager || user.level === Level.DeputyManager || user.level === Level.Manager || approvers.length === 0) {
        const [applicationResult] = await connection.execute<ResultSetHeader>(
          `INSERT INTO application (user_id, start_date, start_half, end_date, end_half, reason, type, total_steps)
					VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
          [
            user.id,
            application.startDate,
            application.startHalf,
            application.endDate,
            application.endHalf,
            application.reason,
            application.type,
          ],
        );
        const [approvalResult] = await connection.execute<ResultSetHeader>(
          `INSERT INTO approval (application_id, step, type)
					VALUES (?, ?, ?)`,
          [applicationResult.insertId, 1, ApprovalType.OR],
        );
        const ids = managers.map((item) => [approvalResult.insertId, item.id]);
        await connection.query(
          `INSERT INTO approval_spec (approval_id, approver_id)
					VALUES ?`,
          [ids],
        );
      }
    });
  }

	async applicationList(openid: string) {
		const [user] = await query<User>("SELECT * FROM user WHERE openid=?", [openid]);
		let rows: ApplicationListItem[] = []
		if (user.level === Level.Manager || user.department === "人力部") {
			rows = await query<ApplicationListItem>(`
				SELECT
					app.id AS id,
					user.name AS applicant,
					app.type AS type,
					ldh.leave_days AS leaveDays,
					app.start_date AS startDate,
					app.start_half AS startHalf,
					app.status AS status,
					app.end_date AS endDate,
					app.end_half AS endHalf
				FROM application app
				LEFT JOIN user on app.user_id = user.id
				LEFT JOIN leave_duration_history ldh ON app.user_id = ldh.user_id AND ldh.year = YEAR(NOW())
			`);
		} else if (user.level === Level.DepartmentManager || user.level === Level.DeputyManager) {
			rows = await query<ApplicationListItem>(`
				SELECT
					app.id AS id,
					user.name AS applicant,
					app.type AS type,
					ldh.leave_days AS leaveDays,
					app.start_date AS startDate,
					app.start_half AS startHalf,
					app.status AS status,
					app.end_date AS endDate,
					app.end_half AS endHalf
				FROM application app
				LEFT JOIN user on app.user_id = user.id
				LEFT JOIN leave_duration_history ldh ON app.user_id = ldh.user_id AND ldh.year = YEAR(NOW())
				WHERE user.department = ?
				AND user.level = 'employee'
			`, [user.department]);
		}
		rows.forEach((value) => {
      value.duration = calculateDuration(
        value.startDate,
        value.startHalf,
        value.endDate,
        value.endHalf,
      );
			if (value.leaveDays === null) {
				value.leaveDays = 0;
			}
    });
		return rows;
	}

  async approve(openid: string, approveInfo: ApproveDto) {
    const status = approveInfo.approved
      ? LeaveStatus.APPROVED
      : LeaveStatus.REJECTED;
    const [approval] = await query<Approval>(
      `
			SELECT
				appr.id AS id,
				appr.application_id AS applicationId,
				appr.step AS step,
				appr.type AS type,
				appr.status AS status
			FROM approval appr
			WHERE appr.id = (
				SELECT approval_id 
				FROM approval_spec appr_spec
				WHERE appr_spec.id = ?
			);	
		`,
      [approveInfo.approvalSpecId],
    );
    const [application] = await query<Application>(
      `
			SELECT 	
				app.id AS id,
				app.type AS type,
				app.status AS status,
				app.start_date AS startDate,
				app.user_id AS userId,
				app.start_half AS startHalf,
				app.end_date AS endDate,
				app.end_half AS endHalf,
				app.reason AS reason,
				app.current_step AS currentStep,
				app.total_steps AS totalSteps
			FROM application app
			WHERE id = ?
		`,
      [approval.applicationId],
    );
    if (application.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('审批已结束');
    }
    if (approval.step < application.currentStep) {
      throw new BadRequestException('当前节点已结束');
    }
    if (approval.step > application.currentStep) {
      throw new BadRequestException('当前节点未开始');
    }
    return await transaction(async (connection) => {
      await connection.execute(
        `UPDATE approval_spec
				SET 
					status=?,
					comment=?
				WHERE id=?`,
        [status, approveInfo.comment, approveInfo.approvalSpecId],
      );

      const statusList = (
        await connection.query(
          `
				SELECT status
				FROM approval_spec
				WHERE approval_id=?`,
          [approval.id],
        )
      )[0] as any[];

      if (statusList.some((item) => item.status === LeaveStatus.REJECTED)) {
        await connection.execute('UPDATE approval SET status=? WHERE id=?', [
          LeaveStatus.REJECTED,
          approval.id,
        ]);
        await connection.execute('UPDATE application SET status=? WHERE id=?', [
          LeaveStatus.REJECTED,
          application.id,
        ]);
        return;
      } else if (approval.type === ApprovalType.And) {
        if (statusList.every((item) => item.status === LeaveStatus.APPROVED)) {
          await connection.execute('UPDATE approval SET status=? WHERE id=?', [
            LeaveStatus.APPROVED,
            approval.id,
          ]);
        }
      } else if (approval.type === ApprovalType.OR) {
        if (statusList.some((item) => item.status === LeaveStatus.APPROVED)) {
          await connection.execute('UPDATE approval SET status=? WHERE id=?', [
            LeaveStatus.APPROVED,
            approval.id,
          ]);
        }
      } else return;
      console.log(
        'cur: %d, tot: %d',
        application.currentStep,
        application.totalSteps,
      );
      if (application.currentStep === application.totalSteps) {
        await connection.execute('UPDATE application SET status=? WHERE id=?', [
          LeaveStatus.APPROVED,
          application.id,
        ]);
				let duration = calculateDuration(application.startDate, application.startHalf, application.endDate, application.endHalf);
				let [historyCount] = (await connection.query("SELECT COUNT(*) AS count FROM leave_duration_history WHERE user_id = ? AND year = ?", [application.userId, application.startDate.getFullYear()]))[0] as any[]
				console.log(historyCount)
				if (historyCount.count === 0) {
					await connection.execute("INSERT INTO leave_duration_history (user_id, year, leave_days) VALUES (?, ?, ?)", [application.userId, application.startDate.getFullYear(), duration])
				} else {
					await connection.execute("UPDATE leave_duration_history SET leave_days = leave_days + ? WHERE user_id = ? AND year = ?", [duration, application.userId, application.startDate.getFullYear()])
				}
      } else {
        await connection.execute(
          'UPDATE application SET current_step=current_step+1 WHERE id=?',
          [application.id],
        );
      }
    });
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
  const d2 = new Date(startDate);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  const diffTime = Math.abs(d1.getTime() - d2.getTime());
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  duration = duration + diffDays;
  return duration;
}
