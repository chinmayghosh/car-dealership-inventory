import { Request, Response } from 'express';
import { AuthService } from './auth.service';

/** Thin HTTP adapter: reads validated input, delegates to the service, shapes the response. */
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  register = async (_req: Request, res: Response) => {
    res.status(201).json(await this.auth.register(res.locals.body));
  };

  login = async (_req: Request, res: Response) => {
    res.json(await this.auth.login(res.locals.body));
  };
}
