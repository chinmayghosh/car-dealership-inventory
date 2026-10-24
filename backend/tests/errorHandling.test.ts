import express from 'express';
import request from 'supertest';
import { createApp } from '../src/app';
import { errorHandler } from '../src/middleware/errorHandler';

describe('error handling', () => {
  const app = createApp();

  it('returns 404 JSON for unknown routes', async () => {
    const res = await request(app).get('/api/does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Route GET /api/does-not-exist not found');
  });

  it('returns 400 for a malformed JSON body', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"email": ');

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Malformed JSON body');
  });

  it('hides unexpected errors behind a generic 500', async () => {
    const failing = express();
    failing.get('/boom', () => {
      throw new Error('database password is hunter2');
    });
    failing.use(errorHandler);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    const res = await request(failing).get('/boom');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: 'Internal server error' });
  });
});
