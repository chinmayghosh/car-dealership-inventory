import request from 'supertest';
import { createApp } from '../../src/app';
import { verifyToken } from '../../src/utils/jwt';
import { prisma, resetDatabase } from '../helpers/db';

const app = createApp();
const credentials = { email: 'jane@example.com', password: 'secret123' };

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await resetDatabase();
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Jane Doe', ...credentials });
  });
  afterAll(() => prisma.$disconnect());

  it('returns a valid JWT and the user profile for correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send(credentials);

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ name: 'Jane Doe', email: 'jane@example.com', role: 'USER' });
    const payload = verifyToken(res.body.token);
    expect(payload.sub).toBe(res.body.user.id);
    expect(payload.role).toBe('USER');
  });

  it('accepts the email in any letter case', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ ...credentials, email: 'JANE@example.com' });

    expect(res.status).toBe(200);
  });

  it('rejects a wrong password with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ ...credentials, password: 'wrong-password' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });

  it('rejects an unknown email with the same 401 message (no user enumeration)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'secret123' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });

  it('rejects a missing password with 400', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: credentials.email });

    expect(res.status).toBe(400);
  });
});
