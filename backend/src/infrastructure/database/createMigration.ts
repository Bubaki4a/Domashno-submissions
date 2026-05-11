import path from 'path';
import { promises as fs } from 'fs';

const MIGRATIONS_DIR = path.resolve(__dirname, './migrations');

function timestamp(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');

  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  const seconds = pad(now.getSeconds());

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

async function ensureMigrationsDir(): Promise<void> {
  await fs.mkdir(MIGRATIONS_DIR, { recursive: true });
}

async function createMigration(): Promise<void> {
  const rawName = process.argv[2] || 'migration';
  const fileName = `${timestamp()}_${slugify(rawName)}.sql`;

  await ensureMigrationsDir();

  const fullPath = path.join(MIGRATIONS_DIR, fileName);

  const template = `-- Up migration: ${rawName}

-- Write your SQL statements here.
-- You can have multiple statements separated by semicolons.

`;

  await fs.writeFile(fullPath, template, 'utf-8');

  console.log(`✅ Created migration file: ${fullPath}`);
}

createMigration().catch((error) => {
  console.error('❌ Failed to create migration:', error);
  process.exit(1);
});

