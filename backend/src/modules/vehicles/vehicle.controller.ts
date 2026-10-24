import { Request, Response } from 'express';
import { VehicleService } from './vehicle.service';

/** Thin HTTP adapter for vehicle endpoints. */
export class VehicleController {
  constructor(private readonly vehicles: VehicleService) {}

  create = async (_req: Request, res: Response) => {
    res.status(201).json(await this.vehicles.create(res.locals.body));
  };
}
