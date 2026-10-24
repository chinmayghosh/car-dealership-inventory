import { PrismaClient, User } from '@prisma/client';

export interface CreateUserData {
  name: string;
  email: string;
  passwordHash: string;
  role?: string;
}

/** Persistence boundary for users; the service depends on this, not on Prisma. */
export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserData): Promise<User>;
}

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly db: PrismaClient) {}

  findByEmail(email: string) {
    return this.db.user.findUnique({ where: { email } });
  }

  create(data: CreateUserData) {
    return this.db.user.create({ data });
  }
}
