import { Vehicle } from '@prisma/client';
import { HttpError } from '../../errors/HttpError';
import { VehicleRepository } from './vehicle.repository';
import { CreateVehicleInput, UpdateVehicleInput, VehicleSearchFilters } from './vehicle.schemas';

/** Business rules for the vehicle inventory. */
export class VehicleService {
  constructor(private readonly vehicles: VehicleRepository) {}

  create(input: CreateVehicleInput): Promise<Vehicle> {
    return this.vehicles.create(input);
  }

  /** Sold-out vehicles are included so the UI can show them with a disabled Purchase button. */
  list(): Promise<Vehicle[]> {
    return this.vehicles.findAll();
  }

  search(filters: VehicleSearchFilters): Promise<Vehicle[]> {
    return this.vehicles.search(filters);
  }

  async update(id: string, input: UpdateVehicleInput): Promise<Vehicle> {
    await this.getOrThrow(id);
    return this.vehicles.update(id, input);
  }

  async delete(id: string): Promise<void> {
    await this.getOrThrow(id);
    await this.vehicles.delete(id);
  }

  private async getOrThrow(id: string): Promise<Vehicle> {
    const vehicle = await this.vehicles.findById(id);
    if (!vehicle) {
      throw HttpError.notFound('Vehicle not found');
    }
    return vehicle;
  }
}
