import { databaseClient } from '../../database/databaseClient';
import type { User, UserWithPassword } from '../../../domain/entities/User/User';
import type { IUserRepository } from '../interfaces/IUserRepository';

const TABLE = 'users';

function rowToUser(row: any): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    createdAt: row.created_at instanceof Date ? row.created_at : new Date(row.created_at),
  };
}

function rowToUserWithPassword(row: any): UserWithPassword {
  return {
    ...rowToUser(row),
    passwordHash: row.password_hash,
  };
}

export class DatabaseUserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<UserWithPassword | null> {
    const rows = await databaseClient.query<any>(
      `SELECT id, email, password_hash, name, role, created_at FROM ${TABLE} WHERE email = ? LIMIT 1`,
      [email],
    );
    if (!rows.length) return null;
    return rowToUserWithPassword(rows[0]);
  }

  async findById(id: number): Promise<User | null> {
    const rows = await databaseClient.query<any>(
      `SELECT id, email, name, role, created_at FROM ${TABLE} WHERE id = ? LIMIT 1`,
      [id],
    );
    if (!rows.length) return null;
    return rowToUser(rows[0]);
  }

  async findAll(): Promise<User[]> {
    const rows = await databaseClient.query<any>(
      `SELECT id, email, name, role, created_at FROM ${TABLE} ORDER BY created_at ASC`,
    );
    return rows.map(rowToUser);
  }

  async create(data: {
    email: string;
    passwordHash: string;
    name: string;
    role: User['role'];
  }): Promise<User> {
    const pool = databaseClient.getPool();
    const [result] = await pool.execute(
      `INSERT INTO ${TABLE} (email, password_hash, name, role, created_at) VALUES (?, ?, ?, ?, NOW(6))`,
      [data.email, data.passwordHash, data.name, data.role],
    );
    const insertId = (result as any).insertId;
    const user = await this.findById(insertId);
    if (!user) throw new Error('Failed to create user');
    return user;
  }

  async update(
    id: number,
    data: { name?: string; email?: string; passwordHash?: string },
  ): Promise<User> {
    const updates: string[] = [];
    const values: any[] = [];
    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.email !== undefined) {
      updates.push('email = ?');
      values.push(data.email);
    }
    if (data.passwordHash !== undefined) {
      updates.push('password_hash = ?');
      values.push(data.passwordHash);
    }
    if (updates.length === 0) {
      const user = await this.findById(id);
      if (!user) throw new Error('User not found');
      return user;
    }
    values.push(id);
    await databaseClient.getPool().execute(
      `UPDATE ${TABLE} SET ${updates.join(', ')} WHERE id = ?`,
      values,
    );
    const user = await this.findById(id);
    if (!user) throw new Error('User not found');
    return user;
  }
}
