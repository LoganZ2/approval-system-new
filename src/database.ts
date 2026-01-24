import { createPool, Pool, PoolConnection } from 'mysql2/promise';
import { Logger } from '@nestjs/common';

const logger = new Logger('Database');

const pool: Pool = createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'approval_system',

  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
  queueLimit: 0,
  waitForConnections: true,
  idleTimeout: 60000,

  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// Log pool initialization
logger.log(
  `Database pool initialized for ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '3306'}`,
);

// 查询封装
export async function query<T>(sql: string, params?: any[]): Promise<T[]> {
  try {
    const [rows] = await pool.query(sql, params);
    return rows as T[];
  } catch (error) {
    logger.error(`Query failed: ${sql}`, error);
    throw error;
  }
}

// 事务封装
export async function transaction<T>(
  callback: (connection: PoolConnection) => Promise<T>,
): Promise<T> {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    logger.error('Transaction failed and rolled back:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// 健康检查
export async function healthCheck(): Promise<boolean> {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (error) {
    logger.error('Database health check failed:', error);
    return false;
  }
}

// 优雅关闭
export async function closePool(): Promise<void> {
  try {
    await pool.end();
    logger.log('Database pool closed gracefully');
  } catch (error) {
    logger.error('Error closing database pool:', error);
    throw error;
  }
}

export default pool;
