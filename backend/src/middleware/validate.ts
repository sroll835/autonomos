import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { badRequest } from '../utils/response';

export const validate = (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      badRequest(res, 'Datos inválidos', result.error.flatten().fieldErrors);
      return;
    }
    req.body = result.data;
    next();
  };
