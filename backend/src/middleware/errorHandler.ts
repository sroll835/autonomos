import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('[Error]', err.message);
  if (process.env.NODE_ENV === 'development') console.error(err.stack);
  res.status(500).json({ success: false, message: 'Error interno del servidor' });
};

export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({ success: false, message: 'Ruta no encontrada' });
};
