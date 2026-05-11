import { databaseClient } from '../../database/databaseClient';
import { SubmissionEntity } from '../../../domain/entities/Submission/SubmissionEntity';
import { Submission } from '../../../domain/entities/Submission/Submission';
import { ISubmissionRepository } from '../interfaces/ISubmissionRepository';

/**
 * Database-backed implementation of ISubmissionRepository.
 * Uses MySQL via databaseClient, but keeps the same interface as the file repository.
 */
export class DatabaseSubmissionRepository implements ISubmissionRepository {
  private readonly tableName = 'submissions';

  /**
   * Save a submission into the database.
   */
  async save(submission: SubmissionEntity): Promise<void> {
    const data = submission.toJSON();
    const createdAtDate = new Date(data.createdAt);

    const pool = databaseClient.getPool();
    await pool.execute(
      `INSERT INTO ${this.tableName} (id, name, email, message, created_at)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         email = VALUES(email),
         message = VALUES(message)`,
      [data.id, data.name, data.email, data.message, createdAtDate],
    );
  }

  /**
   * Return all submissions from the database.
   */
  async findAll(): Promise<Submission[]> {
    const rows = await databaseClient.query<any>(
      `SELECT id, name, email, message, created_at AS createdAt FROM ${this.tableName} ORDER BY created_at DESC`,
    );

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      message: row.message,
      createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : new Date(row.createdAt).toISOString(),
    }));
  }

  /**
   * Find a single submission by its id.
   */
  async findById(id: string): Promise<Submission | null> {
    const rows = await databaseClient.query<any>(
      `SELECT id, name, email, message, created_at AS createdAt FROM ${this.tableName} WHERE id = ? LIMIT 1`,
      [id],
    );

    if (!rows.length) {
      return null;
    }

    const row = rows[0];
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      message: row.message,
      createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : new Date(row.createdAt).toISOString(),
    };
  }

  /**
   * Replace all submissions with the provided list.
   * For compatibility with the file repository interface.
   */
  async saveAll(submissions: Submission[]): Promise<void> {
    // Simple strategy: delete all and re-insert.
    // This matches the semantics of overwriting the JSON file.
    await databaseClient.query(`DELETE FROM ${this.tableName}`);

    if (!submissions.length) {
      return;
    }

    const values: any[] = [];
    const placeholders = submissions
      .map((s) => {
        values.push(s.id, s.name, s.email, s.message, new Date(s.createdAt));
        return '(?, ?, ?, ?, ?)';
      })
      .join(', ');

    await databaseClient.query(
      `
      INSERT INTO ${this.tableName} (id, name, email, message, created_at)
      VALUES ${placeholders}
      `,
      values,
    );
  }
}
