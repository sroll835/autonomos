import { Response } from 'express';

export const ok = (res: Response, data: unknown, message?: string) =>
  res.status(200).json({ success: true, message, data });

export const created = (res: Response, data: unknown, message?: string) =>
  res.status(201).json({ success: true, message, data });

export const badRequest = (res: Response, message: string, errors?: unknown) =>
  res.status(400).json({ success: false, message, errors });

export const unauthorized = (res: Response, message = 'No autorizado') =>
  res.status(401).json({ success: false, message });

export const forbidden = (res: Response, message = 'Acceso denegado') =>
  res.status(403).json({ success: false, message });

export const notFound = (res: Response, message = 'Recurso no encontrado') =>
  res.status(404).json({ success: false, message });

export const conflict = (res: Response, message: string) =>
  res.status(409).json({ success: false, message });

export const serverError = (res: Response, message = 'Error interno del servidor') =>
  res.status(500).json({ success: false, message });
