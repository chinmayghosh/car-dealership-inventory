import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config';

export type Role = 'USER' | 'ADMIN';

export interface TokenPayload {
  sub: string;
  role: Role;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as SignOptions['expiresIn'],
  });
}

/** Returns the decoded payload, or throws if the token is invalid or expired. */
export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, config.jwtSecret) as unknown as TokenPayload;
}
