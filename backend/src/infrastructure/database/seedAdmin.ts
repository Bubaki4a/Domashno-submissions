import 'dotenv/config';
import bcrypt from 'bcrypt';
import { databaseClient } from './databaseClient';

const ADMIN_EMAIL = 'k@k.com';
const ADMIN_PASSWORD = '1';
const ADMIN_NAME = 'Admin';

export async function seedAdmin(): Promise<void> {
  const existing = await databaseClient.query<any>(
    'SELECT id FROM users WHERE email = ? LIMIT 1',
    [ADMIN_EMAIL],
  );

  if (existing.length > 0) {
    console.log('ℹ️ Admin user k@k.com already exists. Skipping seed.');
    return;
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await databaseClient.getPool().execute(
    `INSERT INTO users (email, password_hash, name, role, created_at) VALUES (?, ?, ?, 'administrator', NOW(6))`,
    [ADMIN_EMAIL, passwordHash, ADMIN_NAME],
  );
  console.log('✅ Seeded admin user: k@k.com');
}

if (require.main === module) {
  seedAdmin().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  });
}
