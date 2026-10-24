import request from 'supertest';
import { createApp } from '../../src/app';
import { adminToken, bearer, userToken } from '../helpers/auth';
import { prisma, resetDatabase } from '../helpers/db';
import { aVehicle } from '../helpers/vehicles';

const app = createApp();

describe('POST /api/vehicles', () => {
  beforeEach(resetDatabase);
  afterAll(() => prisma.$disconnect());

  it('lets an admin add a vehicle and returns it with a generated id', async () => {
    const res = await request(app).post('/api/vehicles').set(bearer(adminToken())).send(aVehicle());

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ ...aVehicle(), id: expect.any(String) });
    expect(await prisma.vehicle.count()).toBe(1);
  });

  it('only requires make, model, category, price and quantity', async () => {
    const minimal = { make: 'Ford', model: 'F-150', category: 'Truck', price: 45000, quantity: 2 };
    const res = await request(app).post('/api/vehicles').set(bearer(adminToken())).send(minimal);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject(minimal);
  });

  it('gives each vehicle a unique id', async () => {
    const a = await request(app).post('/api/vehicles').set(bearer(adminToken())).send(aVehicle());
    const b = await request(app).post('/api/vehicles').set(bearer(adminToken())).send(aVehicle());

    expect(a.body.id).not.toBe(b.body.id);
  });

  it('requires authentication', async () => {
    const res = await request(app).post('/api/vehicles').send(aVehicle());

    expect(res.status).toBe(401);
  });

  it('forbids regular users', async () => {
    const res = await request(app).post('/api/vehicles').set(bearer(userToken())).send(aVehicle());

    expect(res.status).toBe(403);
    expect(await prisma.vehicle.count()).toBe(0);
  });

  it.each([
    ['missing make', { make: undefined }],
    ['missing model', { model: '' }],
    ['unknown category', { category: 'Spaceship' }],
    ['negative price', { price: -1 }],
    ['zero price', { price: 0 }],
    ['negative quantity', { quantity: -3 }],
    ['fractional quantity', { quantity: 1.5 }],
    ['implausible year', { year: 1700 }],
    ['invalid image URL', { imageUrl: 'not a url' }],
  ])('rejects %s with 400', async (_case, override) => {
    const res = await request(app)
      .post('/api/vehicles')
      .set(bearer(adminToken()))
      .send(aVehicle(override));

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation failed');
  });
});
