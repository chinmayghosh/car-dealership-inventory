import { Request, Response } from 'express';
import { VehicleService } from './vehicle.service';

type ByIdRequest = Request<{ id: string }>;

/**
 * Thin HTTP adapter for vehicle endpoints. Input has already been validated
 * by middleware and is read from `res.locals`; business rules live in the service.
 */
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

  update = async (req: ByIdRequest, res: Response) => {
    res.json(await this.vehicles.update(req.params.id, res.locals.body));
  };

  delete = async (req: ByIdRequest, res: Response) => {
    await this.vehicles.delete(req.params.id);
    res.status(204).end();
  };

  purchase = async (req: ByIdRequest, res: Response) => {
    res.json(await this.vehicles.purchase(req.params.id, res.locals.body.quantity));
  };

  restock = async (req: ByIdRequest, res: Response) => {
    res.json(await this.vehicles.restock(req.params.id, res.locals.body.quantity));
  };
}
