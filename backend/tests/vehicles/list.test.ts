import request from 'supertest';
import { createApp } from '../../src/app';
import { bearer, userToken } from '../helpers/auth';
import { prisma, resetDatabase } from '../helpers/db';
import { insertVehicle } from '../helpers/vehicles';

const app = createApp();

describe('GET /api/vehicles', () => {
  beforeEach(resetDatabase);
  afterAll(() => prisma.$disconnect());

  it('returns an empty list when there is no inventory', async () => {
    const res = await request(app).get('/api/vehicles').set(bearer(userToken()));

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns every vehicle, including sold-out ones, to any logged-in user', async () => {
    await insertVehicle({ make: 'Toyota' });
    await insertVehicle({ make: 'Honda', quantity: 0 });

    const res = await request(app).get('/api/vehicles').set(bearer(userToken()));

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body.map((v: { make: string }) => v.make).sort()).toEqual(['Honda', 'Toyota']);
  });

  it('lists the newest vehicles first', async () => {
    await insertVehicle({ make: 'Older', createdAt: new Date('2024-01-01') });
    await insertVehicle({ make: 'Newer', createdAt: new Date('2025-01-01') });

    const res = await request(app).get('/api/vehicles').set(bearer(userToken()));

    expect(res.body.map((v: { make: string }) => v.make)).toEqual(['Newer', 'Older']);
  });

  it('requires authentication', async () => {
    const res = await request(app).get('/api/vehicles');

    expect(res.status).toBe(401);
  });
});
