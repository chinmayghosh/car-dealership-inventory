import { Vehicle } from '@prisma/client';
import { VehicleRepository } from './vehicle.repository';
import { CreateVehicleInput, VehicleSearchFilters } from './vehicle.schemas';

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
}
