import request from 'supertest';
import { createApp } from '../../src/app';
import { bearer, userToken } from '../helpers/auth';
import { prisma, resetDatabase } from '../helpers/db';
import { MISSING_ID, insertVehicle } from '../helpers/vehicles';

const app = createApp();

const purchase = (id: string, body?: object) =>
  request(app)
    .post(`/api/vehicles/${id}/purchase`)
    .set(bearer(userToken()))
    .send(body);

const stockOf = async (id: string) =>
  (await prisma.vehicle.findUniqueOrThrow({ where: { id } })).quantity;

describe('POST /api/vehicles/:id/purchase', () => {
  beforeEach(resetDatabase);
  afterAll(() => prisma.$disconnect());

  it('buys one unit by default and returns the updated vehicle', async () => {
    const vehicle = await insertVehicle({ quantity: 3 });

    const res = await purchase(vehicle.id);

    expect(res.status).toBe(200);
    expect(res.body.quantity).toBe(2);
    expect(await stockOf(vehicle.id)).toBe(2);
  });

  it('buys several units when a quantity is given', async () => {
    const vehicle = await insertVehicle({ quantity: 5 });

    const res = await purchase(vehicle.id, { quantity: 3 });

    expect(res.status).toBe(200);
    expect(res.body.quantity).toBe(2);
  });

  it('can buy the last units, leaving the vehicle sold out', async () => {
    const vehicle = await insertVehicle({ quantity: 2 });

    const res = await purchase(vehicle.id, { quantity: 2 });

    expect(res.body.quantity).toBe(0);
  });

  it('rejects buying a sold-out vehicle with 409', async () => {
    const vehicle = await insertVehicle({ quantity: 0 });

    const res = await purchase(vehicle.id);

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('This vehicle is out of stock');
  });

  it('rejects buying more than is in stock with 409 and leaves stock untouched', async () => {
    const vehicle = await insertVehicle({ quantity: 2 });

    const res = await purchase(vehicle.id, { quantity: 5 });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('Only 2 left in stock');
    expect(await stockOf(vehicle.id)).toBe(2);
  });

  it('never oversells when two buyers race for the last unit', async () => {
    const vehicle = await insertVehicle({ quantity: 1 });

    const results = await Promise.all([purchase(vehicle.id), purchase(vehicle.id)]);

    expect(results.map((r) => r.status).sort()).toEqual([200, 409]);
    expect(await stockOf(vehicle.id)).toBe(0);
  });

  it.each([
    ['zero', { quantity: 0 }],
    ['negative', { quantity: -1 }],
    ['fractional', { quantity: 1.5 }],
  ])('rejects a %s quantity with 400', async (_case, body) => {
    const vehicle = await insertVehicle({ quantity: 5 });

    const res = await purchase(vehicle.id, body);

    expect(res.status).toBe(400);
  });

  it('returns 404 for a vehicle that does not exist', async () => {
    const res = await purchase(MISSING_ID);

    expect(res.status).toBe(404);
  });

  it('requires authentication', async () => {
    const vehicle = await insertVehicle();

    const res = await request(app).post(`/api/vehicles/${vehicle.id}/purchase`);

    expect(res.status).toBe(401);
  });
});
