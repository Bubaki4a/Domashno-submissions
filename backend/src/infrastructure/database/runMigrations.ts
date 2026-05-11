import 'dotenv/config';
import path from 'path';
import { promises as fs } from 'fs';
import { databaseClient } from './databaseClient';

const MIGRATIONS_DIR = path.resolve(__dirname, './migrations');

interface MigrationRecord {
  name: string;
  appliedAt: string;
}

async function ensureMigrationsTable(): Promise<void> {
  await databaseClient.query(
    `
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      applied_at DATETIME(6) NOT NULL,
      PRIMARY KEY (id),
      UNIQUE KEY uq_schema_migrations_name (name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
  );
}

async function getAppliedMigrations(): Promise<Set<string>> {
  const rows = await databaseClient.query<MigrationRecord>(
    `SELECT name, applied_at AS appliedAt FROM schema_migrations ORDER BY applied_at ASC`,
  );

  return new Set(rows.map((row) => row.name));
}

async function getMigrationFiles(): Promise<string[]> {
  try {
    const entries = await fs.readdir(MIGRATIONS_DIR, { withFileTypes: true });
    return entries
      .filter((e) => e.isFile() && e.name.endsWith('.sql'))
      .map((e) => e.name)
      .sort(); // lexicographical order = chronological if prefixed with timestamps
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // No migrations directory yet
      return [];
    }
    throw error;
  }
}

export async function runMigrations(): Promise<void> {
  console.log('🔄 Running database migrations...');

  await ensureMigrationsTable();

  const applied = await getAppliedMigrations();
  const files = await getMigrationFiles();

  if (!files.length) {
    console.log('ℹ️ No migration files found. Nothing to do.');
    return;
  }

  const pending = files.filter((name) => !applied.has(name));

  if (!pending.length) {
    console.log('✅ All migrations are already applied.');
    return;
  }

  console.log(`📂 Migrations directory: ${MIGRATIONS_DIR}`);
  console.log('📌 Pending migrations:', pending);

  for (const file of pending) {
    const fullPath = path.join(MIGRATIONS_DIR, file);
    console.log(`➡️ Applying migration: ${file}`);

    const sql = await fs.readFile(fullPath, 'utf-8');

    // Use a dedicated connection to ensure all statements run in a single transaction if possible
    const pool = databaseClient.getPool();
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();
      await connection.query(sql);
      await connection.query(
        'INSERT INTO schema_migrations (name, applied_at) VALUES (?, NOW(6))',
        [file],
      );
      await connection.commit();
      console.log(`✅ Migration applied: ${file}`);
    } catch (error) {
      await connection.rollback();
      console.error(`❌ Failed to apply migration ${file}`, error);
      throw error;
    } finally {
      connection.release();
    }
  }

  console.log('🎉 All pending migrations have been applied.');
}

if (require.main === module) {
  runMigrations().catch((error) => {
    console.error('❌ Migration process failed:', error);
    process.exit(1);
  });
}

