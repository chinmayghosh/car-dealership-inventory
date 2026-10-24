import request from 'supertest';
import { createApp } from '../../src/app';
import { prisma, resetDatabase } from '../helpers/db';

const app = createApp();
const validUser = { name: 'Jane Doe', email: 'jane@example.com', password: 'secret123' };

describe('POST /api/auth/register', () => {
  beforeEach(resetDatabase);
  afterAll(() => prisma.$disconnect());

  it('creates a user and returns a token with the public user profile', async () => {
    const res = await request(app).post('/api/auth/register').send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user).toEqual({
      id: expect.any(String),
      name: 'Jane Doe',
      email: 'jane@example.com',
      role: 'USER',
    });
  });

  it('never exposes or stores the plain-text password', async () => {
    const res = await request(app).post('/api/auth/register').send(validUser);

    expect(res.body.user.password).toBeUndefined();
    expect(res.body.user.passwordHash).toBeUndefined();
    const stored = await prisma.user.findUniqueOrThrow({ where: { email: validUser.email } });
    expect(stored.passwordHash).not.toBe(validUser.password);
  });

  it('normalises the email to lower case', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, email: 'Jane@Example.COM' });

    expect(res.body.user.email).toBe('jane@example.com');
  });

  it('ignores any attempt to self-assign the ADMIN role', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, role: 'ADMIN' });

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('USER');
  });

  it('rejects a duplicate email with 409', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app).post('/api/auth/register').send(validUser);

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/already registered/i);
  });

  it.each([
    ['missing name', { ...validUser, name: '' }],
    ['invalid email', { ...validUser, email: 'not-an-email' }],
    ['short password', { ...validUser, password: '123' }],
  ])('rejects %s with 400', async (_case, body) => {
    const res = await request(app).post('/api/auth/register').send(body);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation failed');
    expect(res.body.errors).toEqual(expect.any(Array));
  });
});
