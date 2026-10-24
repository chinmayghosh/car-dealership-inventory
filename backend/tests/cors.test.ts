import request from 'supertest';

/** Builds the app with a given CORS_ORIGIN, since config is read when modules load. */
function appWithOrigins(origins: string) {
  process.env.CORS_ORIGIN = origins;
  jest.resetModules();
  const { createApp } = require('../src/app') as typeof import('../src/app');
  return createApp();
}

describe('CORS', () => {
  afterAll(() => {
    delete process.env.CORS_ORIGIN;
  });

  it('allows every origin in a comma-separated CORS_ORIGIN list', async () => {
    const app = appWithOrigins('http://localhost:5173, https://apex-motors.vercel.app');

    const local = await request(app).get('/api/health').set('Origin', 'http://localhost:5173');
    const deployed = await request(app).get('/api/health').set('Origin', 'https://apex-motors.vercel.app');

    expect(local.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    expect(deployed.headers['access-control-allow-origin']).toBe('https://apex-motors.vercel.app');
  });

  it('does not allow origins that are not listed', async () => {
    const app = appWithOrigins('http://localhost:5173');

    const res = await request(app).get('/api/health').set('Origin', 'https://evil.example.com');

    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });
});
