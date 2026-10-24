import { signToken } from '../../src/utils/jwt';

export const userToken = () => signToken({ sub: 'test-user', role: 'USER' });
export const adminToken = () => signToken({ sub: 'test-admin', role: 'ADMIN' });

export const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });
