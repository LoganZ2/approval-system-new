import { Injectable } from '@nestjs/common';
import { Application, DayHalf, PendingApproval, User } from '../types';
import { query } from 'src/database';

@Injectable()
export class UserService {
  constructor() {}

  async check(openid: string): Promise<Boolean> {
      let rows = await query(
        `SELECT 
            openid
        FROM user WHERE openid=? AND is_deleted=0`,
        [openid]
      )
      return rows.length !== 0;
  }

  async register(openid: string, user: User) {
    user.openid = openid;
    return await query(
      `INSERT INTO user (name, department, level, openid)
      VALUES (?, ?, ?, ?)`,
      [user.name, user.department, user.level, user.openid]
    )
  }
}