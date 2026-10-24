import request from 'supertest';
import { createApp } from '../../src/app';
import { bearer, userToken } from '../helpers/auth';
import { prisma, resetDatabase } from '../helpers/db';
import { insertVehicle } from '../helpers/vehicles';

const app = createApp();

const search = (query: Record<string, string | number>) =>
  request(app).get('/api/vehicles/search').query(query).set(bearer(userToken()));

const models = (body: { model: string }[]) => body.map((v) => v.model).sort();

describe('GET /api/vehicles/search', () => {
  beforeAll(async () => {
    await resetDatabase();
    await insertVehicle({ make: 'Toyota', model: 'Camry', category: 'Sedan', price: 27000 });
    await insertVehicle({ make: 'Toyota', model: 'RAV4', category: 'SUV', price: 32000 });
    await insertVehicle({ make: 'Tesla', model: 'Model 3', category: 'EV', price: 41000 });
    await insertVehicle({ make: 'Ford', model: 'F-150', category: 'Truck', price: 45000 });
  });
  afterAll(() => prisma.$disconnect());

  it('filters by make, case-insensitively', async () => {
    const res = await search({ make: 'toyota' });

    expect(res.status).toBe(200);
    expect(models(res.body)).toEqual(['Camry', 'RAV4']);
  });

  it('matches partial model names', async () => {
    const res = await search({ model: 'model' });

    expect(models(res.body)).toEqual(['Model 3']);
  });

  it('filters by exact category', async () => {
    const res = await search({ category: 'SUV' });

    expect(models(res.body)).toEqual(['RAV4']);
  });

  it('filters by a price range (inclusive)', async () => {
    const res = await search({ minPrice: 30000, maxPrice: 41000 });

    expect(models(res.body)).toEqual(['Model 3', 'RAV4']);
  });

  it('supports an open-ended price range', async () => {
    expect(models((await search({ minPrice: 41000 })).body)).toEqual(['F-150', 'Model 3']);
    expect(models((await search({ maxPrice: 27000 })).body)).toEqual(['Camry']);
  });

  it('combines several filters with AND', async () => {
    const res = await search({ make: 'Toyota', maxPrice: 30000 });

    expect(models(res.body)).toEqual(['Camry']);
  });

  it('returns everything when no filters are given', async () => {
    const res = await search({});

    expect(res.body).toHaveLength(4);
  });

  it('returns an empty list when nothing matches', async () => {
    const res = await search({ make: 'Lamborghini' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it.each([
    ['a non-numeric price', { minPrice: 'cheap' }],
    ['a negative price', { maxPrice: -5 }],
    ['minPrice greater than maxPrice', { minPrice: 50000, maxPrice: 10000 }],
    ['an unknown category', { category: 'Spaceship' }],
  ])('rejects %s with 400', async (_case, query) => {
    const res = await search(query);

    expect(res.status).toBe(400);
  });

  it('requires authentication', async () => {
    const res = await request(app).get('/api/vehicles/search').query({ make: 'Toyota' });

    expect(res.status).toBe(401);
  });
});
