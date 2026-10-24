import bcrypt from 'bcryptjs';
import { User } from '@prisma/client';
import { HttpError } from '../../errors/HttpError';
import { Role, signToken } from '../../utils/jwt';
import { RegisterInput } from './auth.schemas';
import { UserRepository } from './user.repository';

const SALT_ROUNDS = 10;

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthResult {
  token: string;
  user: PublicUser;
}

/** Strips sensitive fields before a user leaves the service layer. */
function toPublicUser(user: User): PublicUser {
  return { id: user.id, name: user.name, email: user.email, role: user.role as Role };
}

export class AuthService {
  constructor(private readonly users: UserRepository) {}

  /** Registers a regular user. Admins are only ever created by the seed script. */
  async register(input: RegisterInput): Promise<AuthResult> {
    if (await this.users.findByEmail(input.email)) {
      throw HttpError.conflict('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const user = await this.users.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: 'USER',
    });

    return this.issueToken(user);
  }

  private issueToken(user: User): AuthResult {
    const publicUser = toPublicUser(user);
    return { token: signToken({ sub: user.id, role: publicUser.role }), user: publicUser };
  }
}
