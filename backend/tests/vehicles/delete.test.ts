import request from 'supertest';
import { createApp } from '../../src/app';
import { adminToken, bearer, userToken } from '../helpers/auth';
import { prisma, resetDatabase } from '../helpers/db';
import { MISSING_ID, insertVehicle } from '../helpers/vehicles';

const app = createApp();

describe('DELETE /api/vehicles/:id', () => {
  beforeEach(resetDatabase);
  afterAll(() => prisma.$disconnect());

  it('lets an admin delete a vehicle', async () => {
    const vehicle = await insertVehicle();

    const res = await request(app).delete(`/api/vehicles/${vehicle.id}`).set(bearer(adminToken()));

    expect(res.status).toBe(204);
    expect(await prisma.vehicle.findUnique({ where: { id: vehicle.id } })).toBeNull();
  });

  it('returns 404 for a vehicle that does not exist', async () => {
    const res = await request(app).delete(`/api/vehicles/${MISSING_ID}`).set(bearer(adminToken()));

    expect(res.status).toBe(404);
  });

  it('forbids regular users and keeps the vehicle', async () => {
    const vehicle = await insertVehicle();

    const res = await request(app).delete(`/api/vehicles/${vehicle.id}`).set(bearer(userToken()));

    expect(res.status).toBe(403);
    expect(await prisma.vehicle.count()).toBe(1);
  });

  it('requires authentication', async () => {
    const vehicle = await insertVehicle();

    const res = await request(app).delete(`/api/vehicles/${vehicle.id}`);

    expect(res.status).toBe(401);
  });
});
