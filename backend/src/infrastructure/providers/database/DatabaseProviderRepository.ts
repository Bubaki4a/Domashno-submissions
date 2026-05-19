import { databaseClient } from '../../database/databaseClient';
import { ProviderSource } from '../../../domain/providers/ProviderSource';
import { IProviderRepository } from '../interfaces/IProviderRepository';

/**
 * Database-backed implementation of IProviderRepository.
 * Handles both provider configurations and raw source storage.
 */
export class DatabaseProviderRepository implements IProviderRepository {
  private readonly sourcesTable = 'provider_sources';
  private readonly providersTable = 'providers';

  /**
   * Първа задача: Извличане на всички доставчици от базата данни
   */
  async findAllProviders(): Promise<any[]> {
  return await databaseClient.query<any>(
    `SELECT id, slug, display_name as displayName, is_configured as isConfigured, last_sync as lastSync 
     FROM ${this.providersTable} 
     ORDER BY display_name ASC`
  );
}

  /**
   * Извличане на конкретен доставчик по ID
   */
  async findProviderById(id: string): Promise<any | null> {
    const rows = await databaseClient.query<any>(
      `SELECT * FROM ${this.providersTable} WHERE id = ? LIMIT 1`,
      [id]
    );
    return rows.length ? rows[0] : null;
  }

  /**
   * Creates a filename-like identifier similar to the file-based implementation.
   */
  private generateFilename(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `products-${year}-${month}-${day}_${hours}-${minutes}-${seconds}.json`;
  }

  async saveSource(
    providerId: string,
    provider: string,
    products: any[],
  ): Promise<string> {
    const timestamp = new Date();
    const filename = this.generateFilename(timestamp);

    const source: ProviderSource = {
      timestamp: timestamp.toISOString(),
      provider,
      products,
    };

    const pool = databaseClient.getPool();
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // 1. Записваме самия източник (raw JSON)
      await connection.execute(
        `INSERT INTO ${this.sourcesTable} (
          provider_id,
          filename,
          provider,
          timestamp,
          products
        )
        VALUES (?, ?, ?, ?, ?)`,
        [
          providerId,
          filename,
          provider,
          timestamp,
          JSON.stringify(source.products),
        ],
      );

      // 2. Обновяваме последната синхронизация в таблицата providers
      await connection.execute(
        `UPDATE ${this.providersTable} SET last_sync = ? WHERE id = ?`,
        [timestamp, providerId]
      );

      await connection.commit();
      return filename;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async readSource(
    providerId: string,
    filename: string,
  ): Promise<ProviderSource | null> {
    const rows = await databaseClient.query<any>(
      `
      SELECT
        provider,
        timestamp,
        products
      FROM ${this.sourcesTable}
      WHERE provider_id = ? AND filename = ?
      LIMIT 1
      `,
      [providerId, filename],
    );

    if (!rows.length) {
      return null;
    }

    const row = rows[0];
    const timestamp =
      row.timestamp instanceof Date
        ? row.timestamp.toISOString()
        : new Date(row.timestamp).toISOString();

    const products =
      row.products == null
        ? []
        : typeof row.products === 'string'
          ? JSON.parse(row.products)
          : Array.isArray(row.products)
            ? row.products
            : [];

    return {
      timestamp,
      provider: row.provider,
      products,
    };
  }

  async getAllSourceFiles(providerId?: string): Promise<string[]> {
    const params: any[] = [];
    let whereClause = '';

    if (providerId) {
      whereClause = 'WHERE provider_id = ?';
      params.push(providerId);
    }

    const rows = await databaseClient.query<any>(
      `
      SELECT filename
      FROM ${this.sourcesTable}
      ${whereClause}
      ORDER BY timestamp DESC
      `,
      params,
    );

    return rows.map((row) => row.filename as string);
  }
}