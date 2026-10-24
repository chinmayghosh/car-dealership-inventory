import express, { Express } from 'express';
import cors from 'cors';
import { config } from './config';

/**
 * Builds the Express application. Kept separate from `server.ts` so tests
 * can exercise the app with Supertest without opening a network port.
 */
export function createApp(): Express {
  const app = express();

  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  return app;
}
