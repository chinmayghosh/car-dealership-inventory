import { PrismaClient, Vehicle } from '@prisma/client';
import { CreateVehicleInput } from './vehicle.schemas';

/** Persistence boundary for vehicles; the service depends on this, not on Prisma. */
export interface VehicleRepository {
  create(data: CreateVehicleInput): Promise<Vehicle>;
  findAll(): Promise<Vehicle[]>;
}

export class PrismaVehicleRepository implements VehicleRepository {
  constructor(private readonly db: PrismaClient) {}

  create(data: CreateVehicleInput) {
    return this.db.vehicle.create({ data });
  }

  findAll() {
    return this.db.vehicle.findMany({ orderBy: { createdAt: 'desc' } });
  }
}
