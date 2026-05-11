/**
 * Global setup for integration tests: set test env, run migrations, seed admin.
 * Env must be set before any import that uses databaseClient.
 */
import path from 'path';
import { config } from 'dotenv';

// Load .env.test from backend directory (when run from backend/)
const backendDir = path.resolve(__dirname, '../../..');
config({ path: path.join(backendDir, '.env.test') });

process.env.DB_NAME = process.env.DB_NAME || 'somerch_product_optimizer_test';
process.env.STORAGE_DRIVER = process.env.STORAGE_DRIVER || 'database';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

export default async function globalSetup(): Promise<void> {
  const { runMigrations } = await import(
    '../../../src/infrastructure/database/runMigrations'
  );
  await runMigrations();

  const { seedAdmin } = await import(
    '../../../src/infrastructure/database/seedAdmin'
  );
  await seedAdmin();
}

