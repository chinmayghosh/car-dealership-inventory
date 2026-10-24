import request from 'supertest';
import { createApp } from '../../src/app';
import { adminToken, bearer, userToken } from '../helpers/auth';
import { prisma, resetDatabase } from '../helpers/db';
import { insertVehicle } from '../helpers/vehicles';

const app = createApp();
const MISSING_ID = '00000000-0000-0000-0000-000000000000';

describe('PUT /api/vehicles/:id', () => {
  beforeEach(resetDatabase);
  afterAll(() => prisma.$disconnect());

  it('lets an admin update some fields and leaves the others unchanged', async () => {
    const vehicle = await insertVehicle({ price: 27000, color: 'Silver' });

    const res = await request(app)
      .put(`/api/vehicles/${vehicle.id}`)
      .set(bearer(adminToken()))
      .send({ price: 25500, color: 'Midnight Black' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: vehicle.id,
      make: vehicle.make,
      model: vehicle.model,
      price: 25500,
      color: 'Midnight Black',
    });
    const stored = await prisma.vehicle.findUniqueOrThrow({ where: { id: vehicle.id } });
    expect(stored.price).toBe(25500);
  });

  it('returns 404 for a vehicle that does not exist', async () => {
    const res = await request(app)
      .put(`/api/vehicles/${MISSING_ID}`)
      .set(bearer(adminToken()))
      .send({ price: 1000 });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Vehicle not found');
  });

  it('rejects an empty update body with 400', async () => {
    const vehicle = await insertVehicle();

    const res = await request(app).put(`/api/vehicles/${vehicle.id}`).set(bearer(adminToken())).send({});

    expect(res.status).toBe(400);
  });

  it('rejects invalid values with 400', async () => {
    const vehicle = await insertVehicle();

    const res = await request(app)
      .put(`/api/vehicles/${vehicle.id}`)
      .set(bearer(adminToken()))
      .send({ price: -100, category: 'Spaceship' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveLength(2);
  });

  it('forbids regular users', async () => {
    const vehicle = await insertVehicle();

    const res = await request(app)
      .put(`/api/vehicles/${vehicle.id}`)
      .set(bearer(userToken()))
      .send({ price: 1 });

    expect(res.status).toBe(403);
  });

  it('requires authentication', async () => {
    const vehicle = await insertVehicle();

    const res = await request(app).put(`/api/vehicles/${vehicle.id}`).send({ price: 1 });

    expect(res.status).toBe(401);
  });
});
