import { Vehicle } from '@prisma/client';
import { HttpError } from '../../src/errors/HttpError';
import { VehicleRepository } from '../../src/modules/vehicles/vehicle.repository';
import { VehicleService } from '../../src/modules/vehicles/vehicle.service';

/**
 * In-memory fake: proves the service's business rules work against the
 * VehicleRepository interface alone, without Prisma or a database.
 */
class FakeVehicleRepository implements VehicleRepository {
  constructor(private readonly store: Vehicle[] = []) {}

  async create(data: Parameters<VehicleRepository['create']>[0]) {
    const now = new Date();
    const vehicle = {
      year: null,
      color: null,
      imageUrl: null,
      description: null,
      ...data,
      id: String(this.store.length + 1),
      createdAt: now,
      updatedAt: now,
    } as Vehicle;
    this.store.push(vehicle);
    return vehicle;
  }
  async findAll() {
    return [...this.store];
  }
  async findById(id: string) {
    return this.store.find((v) => v.id === id) ?? null;
  }
  async search() {
    return [...this.store];
  }
  async update(id: string, data: Partial<Vehicle>) {
    const vehicle = (await this.findById(id))!;
    Object.assign(vehicle, data);
    return vehicle;
  }
  async delete(id: string) {
    this.store.splice(this.store.findIndex((v) => v.id === id), 1);
  }
  async decrementStockIfAvailable(id: string, units: number) {
    const vehicle = await this.findById(id);
    if (!vehicle || vehicle.quantity < units) return false;
    vehicle.quantity -= units;
    return true;
  }
  async incrementStock(id: string, units: number) {
    const vehicle = (await this.findById(id))!;
    vehicle.quantity += units;
    return vehicle;
  }
}

describe('VehicleService (unit)', () => {
  let service: VehicleService;
  let id: string;

  beforeEach(async () => {
    service = new VehicleService(new FakeVehicleRepository());
    ({ id } = await service.create({
      make: 'Mazda',
      model: 'MX-5',
      category: 'Convertible',
      price: 30000,
      quantity: 2,
    }));
  });

  it('decrements stock on purchase', async () => {
    expect((await service.purchase(id, 2)).quantity).toBe(0);
  });

  it('reports remaining stock when a purchase exceeds it', async () => {
    await expect(service.purchase(id, 3)).rejects.toMatchObject({
      status: 409,
      message: 'Only 2 left in stock',
    });
  });

  it('increments stock on restock', async () => {
    expect((await service.restock(id, 5)).quantity).toBe(7);
  });

  it('throws a 404 HttpError for unknown ids', async () => {
    await expect(service.update('missing', { price: 1 })).rejects.toBeInstanceOf(HttpError);
    await expect(service.delete('missing')).rejects.toMatchObject({ status: 404 });
  });
});
