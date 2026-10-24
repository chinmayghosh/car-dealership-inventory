import express, { Express } from 'express';
import cors from 'cors';
import { config } from './config';
import { prisma } from './db/prisma';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { AuthController } from './modules/auth/auth.controller';
import { authRoutes } from './modules/auth/auth.routes';
import { AuthService } from './modules/auth/auth.service';
import { PrismaUserRepository } from './modules/auth/user.repository';
import { VehicleController } from './modules/vehicles/vehicle.controller';
import { PrismaVehicleRepository } from './modules/vehicles/vehicle.repository';
import { vehicleRoutes } from './modules/vehicles/vehicle.routes';
import { VehicleService } from './modules/vehicles/vehicle.service';

/**
 * Builds the Express application and wires its dependencies together
 * (composition root). Kept separate from `server.ts` so tests can exercise
 * the app with Supertest without opening a network port.
 */
export function createApp(): Express {
  const app = express();

  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  const authService = new AuthService(new PrismaUserRepository(prisma));
  app.use('/api/auth', authRoutes(new AuthController(authService)));

  const vehicleService = new VehicleService(new PrismaVehicleRepository(prisma));
  app.use('/api/vehicles', vehicleRoutes(new VehicleController(vehicleService)));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
