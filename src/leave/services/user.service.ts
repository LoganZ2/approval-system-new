import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from '../types';
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

  async detail(openid: string) {
    return await query<User>("SELECT id, name, department, level, openid FROM user WHERE openid=?", [openid])
  }

  async register(openid: string, user: User) {
    user.openid = openid;
    try {
      return await query(
        `INSERT INTO user (name, department, level, openid)
        VALUES (?, ?, ?, ?)`,
        [user.name, user.department, user.level, user.openid]
      )
    } catch(e) {
      switch(e.errno) {
        case 1062:
          throw new HttpException('用户名已存在', HttpStatus.CONFLICT)
        default:
          throw e;
      }
    }

  }
}