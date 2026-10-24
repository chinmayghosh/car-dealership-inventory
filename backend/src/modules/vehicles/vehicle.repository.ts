import { PrismaClient, Vehicle } from '@prisma/client';
import { CreateVehicleInput, VehicleSearchFilters } from './vehicle.schemas';

/** Persistence boundary for vehicles; the service depends on this, not on Prisma. */
export interface VehicleRepository {
  create(data: CreateVehicleInput): Promise<Vehicle>;
  findAll(): Promise<Vehicle[]>;
  search(filters: VehicleSearchFilters): Promise<Vehicle[]>;
}

export class PrismaVehicleRepository implements VehicleRepository {
  constructor(private readonly db: PrismaClient) {}

  create(data: CreateVehicleInput) {
    return this.db.vehicle.create({ data });
  }

  findAll() {
    return this.db.vehicle.findMany({ orderBy: { createdAt: 'desc' } });
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
}
