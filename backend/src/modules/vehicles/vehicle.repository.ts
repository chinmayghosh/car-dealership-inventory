import { PrismaClient, Vehicle } from '@prisma/client';
import { CreateVehicleInput, UpdateVehicleInput, VehicleSearchFilters } from './vehicle.schemas';

/** Persistence boundary for vehicles; the service depends on this, not on Prisma. */
export interface VehicleRepository {
  create(data: CreateVehicleInput): Promise<Vehicle>;
  findAll(): Promise<Vehicle[]>;
  findById(id: string): Promise<Vehicle | null>;
  search(filters: VehicleSearchFilters): Promise<Vehicle[]>;
  update(id: string, data: UpdateVehicleInput): Promise<Vehicle>;
  delete(id: string): Promise<void>;
  /** Atomically removes `units` from stock only if enough are available. Returns false otherwise. */
  decrementStockIfAvailable(id: string, units: number): Promise<boolean>;
  incrementStock(id: string, units: number): Promise<Vehicle>;
}

export class PrismaVehicleRepository implements VehicleRepository {
  constructor(private readonly db: PrismaClient) {}

  create(data: CreateVehicleInput) {
    return this.db.vehicle.create({ data });
  }

  findAll() {
    return this.db.vehicle.findMany({ orderBy: { createdAt: 'desc' } });
  }

  findById(id: string) {
    return this.db.vehicle.findUnique({ where: { id } });
  }

  /** SQLite's LIKE (used by `contains`) is case-insensitive for ASCII text. */
  search({ make, model, category, minPrice, maxPrice }: VehicleSearchFilters) {
    return this.db.vehicle.findMany({
      where: {
        ...(make && { make: { contains: make } }),
        ...(model && { model: { contains: model } }),
        ...(category && { category }),
        price: { gte: minPrice, lte: maxPrice },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  update(id: string, data: UpdateVehicleInput) {
    return this.db.vehicle.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.db.vehicle.delete({ where: { id } });
  }

  /**
   * The stock check and the decrement happen in one conditional UPDATE, so two
   * simultaneous buyers can never both take the last unit.
   */
  async decrementStockIfAvailable(id: string, units: number) {
    const { count } = await this.db.vehicle.updateMany({
      where: { id, quantity: { gte: units } },
      data: { quantity: { decrement: units } },
    });
    return count === 1;
  }

  incrementStock(id: string, units: number) {
    return this.db.vehicle.update({
      where: { id },
      data: { quantity: { increment: units } },
    });
  }
}
