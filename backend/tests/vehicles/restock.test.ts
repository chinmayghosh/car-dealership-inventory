import request from 'supertest';
import { createApp } from '../../src/app';
import { adminToken, bearer, userToken } from '../helpers/auth';
import { prisma, resetDatabase } from '../helpers/db';
import { MISSING_ID, insertVehicle } from '../helpers/vehicles';

const app = createApp();

const restock = (id: string, body: object, token = adminToken()) =>
  request(app).post(`/api/vehicles/${id}/restock`).set(bearer(token)).send(body);

describe('POST /api/vehicles/:id/restock', () => {
  beforeEach(resetDatabase);
  afterAll(() => prisma.$disconnect());

  it('lets an admin increase stock and returns the updated vehicle', async () => {
    const vehicle = await insertVehicle({ quantity: 2 });

    const res = await restock(vehicle.id, { quantity: 10 });

    expect(res.status).toBe(200);
    expect(res.body.quantity).toBe(12);
  });

  it('brings a sold-out vehicle back into stock', async () => {
    const vehicle = await insertVehicle({ quantity: 0 });

    const res = await restock(vehicle.id, { quantity: 1 });

    expect(res.body.quantity).toBe(1);
  });

  it.each([
    ['missing', {}],
    ['zero', { quantity: 0 }],
    ['negative', { quantity: -4 }],
    ['fractional', { quantity: 2.5 }],
  ])('rejects a %s quantity with 400', async (_case, body) => {
    const vehicle = await insertVehicle();

    const res = await restock(vehicle.id, body);

    expect(res.status).toBe(400);
  });

  it('returns 404 for a vehicle that does not exist', async () => {
    const res = await restock(MISSING_ID, { quantity: 1 });

    expect(res.status).toBe(404);
  });

  it('forbids regular users and leaves stock unchanged', async () => {
    const vehicle = await insertVehicle({ quantity: 2 });

    const res = await restock(vehicle.id, { quantity: 5 }, userToken());

    expect(res.status).toBe(403);
    expect((await prisma.vehicle.findUniqueOrThrow({ where: { id: vehicle.id } })).quantity).toBe(2);
  });

  it('requires authentication', async () => {
    const vehicle = await insertVehicle();

    const res = await request(app).post(`/api/vehicles/${vehicle.id}/restock`).send({ quantity: 1 });

    expect(res.status).toBe(401);
  });
});
