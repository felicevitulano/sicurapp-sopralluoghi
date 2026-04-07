import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Dati non validi',
      details: err.errors,
    });
  }

  logger.error({ err }, 'Errore non gestito');
  res.status(500).json({ error: 'Errore interno del server' });
}
