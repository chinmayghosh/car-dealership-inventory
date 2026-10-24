import { Request, Response } from 'express';
import { VehicleService } from './vehicle.service';

/** Thin HTTP adapter for vehicle endpoints. */
export class VehicleController {
  constructor(private readonly vehicles: VehicleService) {}

  create = async (_req: Request, res: Response) => {
    res.status(201).json(await this.vehicles.create(res.locals.body));
  };

  list = async (_req: Request, res: Response) => {
    res.json(await this.vehicles.list());
  };

  search = async (_req: Request, res: Response) => {
    res.json(await this.vehicles.search(res.locals.query));
  };

  update = async (req: Request<{ id: string }>, res: Response) => {
    res.json(await this.vehicles.update(req.params.id, res.locals.body));
  };
}
