import { prisma } from '../../src/db/prisma';

/** Wipes all tables so every test starts from a known, empty state. */
export async function resetDatabase(): Promise<void> {
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();
}

export { prisma };
