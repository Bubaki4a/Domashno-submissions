import 'dotenv/config';
import mysql, { Pool } from 'mysql2/promise';

const pool: Pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'somerch_product_optimizer',
  waitForConnections: true,
  connectionLimit: process.env.DB_CONNECTION_LIMIT
    ? Number(process.env.DB_CONNECTION_LIMIT)
    : 10,
  queueLimit: 0,
  // Allow executing multi-statement SQL in migrations.
  multipleStatements: true,
});

export const databaseClient = {
  /**
   * Execute a query that returns rows.
   */
  async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    const [rows] = await pool.query<T[]>(sql, params);
    return rows;
  },

  /**
   * Access to the underlying pool if needed.
   */
  getPool(): Pool {
    return pool;
  },
};

