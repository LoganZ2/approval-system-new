import { createPool, Pool, PoolConnection } from "mysql2/promise";

const pool: Pool = createPool({
    host: "sh-cynosdbmysql-grp-hoe3x62a.sql.tencentcdb.com",
    port: 25454,
    user: "root",
    password: "Zky040617",
    database: "approval_system",

    connectionLimit: 10,
    queueLimit: 0,
    waitForConnections: true,
    idleTimeout: 60000,

    enableKeepAlive: true,
    keepAliveInitialDelay: 0
})


// 查询封装
export async function query<T>(sql: string, params?: any[]): Promise<T[]> {
  const [rows] = await pool.query(sql, params);
  return rows as T[];
}

// 事务封装
export async function transaction<T>(
  callback: (connection: PoolConnection) => Promise<T>
): Promise<T> {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export default pool

