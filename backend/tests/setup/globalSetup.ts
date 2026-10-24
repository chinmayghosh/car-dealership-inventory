import { execSync } from 'child_process';
import { rmSync } from 'fs';
import path from 'path';

/** Builds a fresh, throwaway SQLite test database from the Prisma schema once per test run. */
export default function globalSetup(): void {
  const testDb = path.join(__dirname, '..', '..', 'prisma', 'test.db');
  rmSync(testDb, { force: true });
  rmSync(`${testDb}-journal`, { force: true });

  execSync('npx prisma db push --skip-generate', {
    env: { ...process.env, DATABASE_URL: 'file:./test.db' },
    stdio: 'ignore',
  });
}
