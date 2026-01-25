import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Level, UpdateInfoRequest, UpdateInfoRequestResult, UpdateInfoType, User } from '../types';
import { RegisterUserDto } from '../dto/register-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { query, transaction } from 'src/database';

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
    let [count] = await query<any>("SELECT COUNT(*) AS count FROM user");
    if (count.count === 0) {
      await query("INSERT INTO user (name, department, level, openid, is_deleted) VALUES (?, ?, ?, ?, 0)", [user.name, user.department, user.level, openid])
      return
    }
    await transaction(async (connection) => {
      await connection.execute("DELETE FROM update_info_request WHERE openid=? AND is_finished = 0", [openid])
      const userName = (await connection.query("SELECT name FROM user WHERE name=?", [user.name]))[0] as any[]
      if (userName.length > 0) throw new HttpException('用户名已存在', HttpStatus.CONFLICT);
      await connection.execute("INSERT INTO update_info_request (type, name, department, level, openid, is_finished) VALUES ('register', ?, ?, ?, ?, 0)", [user.name, user.department, user.level, openid])
    })
  }

  async update(openid: string, user: UpdateUserDto) {
    await transaction(async (connection) => {
      await connection.execute("DELETE FROM update_info_request WHERE openid=? AND is_finished = 0", [openid])
      const userName = (await connection.query("SELECT name FROM user WHERE name=? AND id!=?", [user.name, user.id]))[0] as any[]
      const [currentUser] = (await connection.query("SELECT * FROM user WHERE id=?", [user.id]))[0] as any[]
      if (!currentUser) throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
      if (userName.length > 0) throw new HttpException('用户名已存在', HttpStatus.CONFLICT);
      await connection.execute("INSERT INTO update_info_request (user_id, type, name, department, level, openid, is_finished) VALUES (?, 'update', ?, ?, ?, ?, 0)", [user.id, user.name, user.department, user.level, openid])
    })
  }

  async updateInfoRequests(openid: string) {
    let [slf] = await query<User>("SELECT * FROM user WHERE openid=?", [openid]);
    if (slf.department !== "人力部" && slf.level !== Level.Manager) throw new HttpException('用户无权查看', HttpStatus.BAD_REQUEST);
    let sql = `
      SELECT
        id AS id,
        user_id AS userId,
        type AS type,
        name AS name,
        department AS department,
        level AS level
      FROM update_info_request
      WHERE is_finished = 0
    `
    let reqs = await query<UpdateInfoRequest>(sql)
    let resArray: UpdateInfoRequest[] = []
    for (const req of reqs) {
      if (req.type === UpdateInfoType.Update) {
        let [currentUser] = await query<User>("SELECT * FROM user WHERE id=?", [req.userId])
        if (currentUser) {
          req.oldName = currentUser.name;
          req.oldDepartment = currentUser.department;
          req.oldLevel = currentUser.level;
        }
      }
      resArray.push(req)
    }
    return resArray
  }

  async approveUpdateInfoRequest(openid: string, result: UpdateInfoRequestResult) {
    console.log(result)
    let [slf] = await query<User>("SELECT * FROM user WHERE openid=?", [openid]);
    if (slf.department !== "人力部" && slf.level !== Level.Manager) throw new HttpException('用户无权执行操作', HttpStatus.BAD_REQUEST);
    await transaction(async (connection) => {
      await connection.execute("UPDATE update_info_request SET is_finished=1 WHERE id=?", [result.id])
      let [uir] = (await connection.query("SELECT * FROM update_info_request WHERE id=?", [result.id]))[0] as any[]
      if (result.pass) {
        if (uir.type === "register") {
          await connection.execute("INSERT INTO user (name, department, level, openid) VALUES (?, ?, ?, ?)", [uir.name, uir.department, uir.level, uir.openid])
        } else if (uir.type === "update") {
          await connection.execute("UPDATE user SET name=?, department=?, level=? WHERE id=?", [uir.name, uir.department, uir.level, uir.user_id])
        }
      }
    })
  }
}
