import { Router } from 'express';
import { authenticate, requireAdmin } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { VehicleController } from './vehicle.controller';
import { createVehicleSchema, searchVehicleSchema } from './vehicle.schemas';

/** All vehicle routes require a logged-in user; mutations of the catalogue require an admin. */
export function vehicleRoutes(controller: VehicleController): Router {
  const router = Router();
  router.use(authenticate);

  router.get('/', controller.list);
  router.get('/search', validate(searchVehicleSchema, 'query'), controller.search);
  router.post('/', requireAdmin, validate(createVehicleSchema), controller.create);

  return router;
}
