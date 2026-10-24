import express from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { authenticate, requireAdmin } from '../../src/middleware/auth';
import { errorHandler } from '../../src/middleware/errorHandler';
import { signToken } from '../../src/utils/jwt';

/** A tiny app with one protected and one admin-only route, to test the guards in isolation. */
function buildTestApp() {
  const app = express();
  app.get('/protected', authenticate, (_req, res) => {
    res.json({ user: res.locals.user });
  });
  app.get('/admin', authenticate, requireAdmin, (_req, res) => {
    res.json({ ok: true });
  });
  app.use(errorHandler);
  return app;
}

const app = buildTestApp();
const userToken = signToken({ sub: 'user-1', role: 'USER' });
const adminToken = signToken({ sub: 'admin-1', role: 'ADMIN' });

describe('authenticate middleware', () => {
  it('rejects a request with no Authorization header', async () => {
    const res = await request(app).get('/protected');

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Authentication required');
  });

  it('rejects a header that is not a Bearer token', async () => {
    const res = await request(app).get('/protected').set('Authorization', `Basic ${userToken}`);

    expect(res.status).toBe(401);
  });

  it('rejects a tampered or invalid token', async () => {
    const res = await request(app).get('/protected').set('Authorization', 'Bearer not.a.real.token');

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid or expired token');
  });

  it('rejects an expired token', async () => {
    const expired = jwt.sign({ sub: 'user-1', role: 'USER' }, process.env.JWT_SECRET!, { expiresIn: -10 });
    const res = await request(app).get('/protected').set('Authorization', `Bearer ${expired}`);

    expect(res.status).toBe(401);
  });

  it('attaches the authenticated user for a valid token', async () => {
    const res = await request(app).get('/protected').set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.user).toEqual({ id: 'user-1', role: 'USER' });
  });
});

describe('requireAdmin middleware', () => {
  it('forbids a regular user with 403', async () => {
    const res = await request(app).get('/admin').set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });

  it('allows an admin through', async () => {
    const res = await request(app).get('/admin').set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });
});
