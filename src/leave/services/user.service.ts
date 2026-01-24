import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from '../types';
import { RegisterUserDto } from '../dto/register-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { query } from 'src/database';

@Injectable()
export class UserService {
  constructor() {}

  async check(openid: string): Promise<boolean> {
    const rows = await query(
      `SELECT 
            openid
        FROM user WHERE openid=? AND is_deleted=0`,
      [openid],
    );
    return rows.length !== 0;
  }

  async detail(openid: string) {
    return (
      await query<User>(
        'SELECT id, name, department, level, openid FROM user WHERE openid=?',
        [openid],
      )
    )[0];
  }

  async register(openid: string, user: RegisterUserDto) {
    try {
      return await query(
        `INSERT INTO user (name, department, level, openid)
        VALUES (?, ?, ?, ?)`,
        [user.name, user.department, user.level, openid],
      );
    } catch (e) {
      switch (e.errno) {
        case 1062:
          throw new HttpException('用户名已存在', HttpStatus.CONFLICT);
        default:
          throw e;
      }
    }
  }

  async update(openid: string, user: UpdateUserDto) {
    await query('UPDATE user SET name=?, level=?, department=? WHERE id=?', [
      user.name,
      user.level,
      user.department,
      user.id,
    ]);
  }
}
