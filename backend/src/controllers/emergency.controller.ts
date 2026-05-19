import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { ok, created, notFound } from '../utils/response';
import { getIO } from '../services/socket.service';

const prisma = new PrismaClient();

export const createEmergency = async (req: AuthRequest, res: Response): Promise<void> => {
  const { type, location, address } = req.body;
  const emergency = await prisma.emergency.create({
    data: {
      userId: req.user!.userId,
      type,
      locationLat: location.latitude,
      locationLng: location.longitude,
      address,
      status: 'ACTIVE',
    },
  });

  // Notify emergency services (in real app, this triggers dispatch system)
  getIO()?.emit('emergency:new', { emergencyId: emergency.id, type, location });

  created(res, {
    ...emergency,
    location: { latitude: emergency.locationLat, longitude: emergency.locationLng },
    eta: Math.floor(Math.random() * 10) + 5, // Simulated ETA 5-15 min
    ambulanceDriver: 'En camino',
  });
};

export const getEmergency = async (req: AuthRequest, res: Response): Promise<void> => {
  const emergency = await prisma.emergency.findFirst({
    where: { id: req.params.id, userId: req.user!.userId },
  });
  if (!emergency) { notFound(res); return; }
  ok(res, { ...emergency, location: { latitude: emergency.locationLat, longitude: emergency.locationLng } });
};

export const updateLocation = async (req: AuthRequest, res: Response): Promise<void> => {
  const { location } = req.body;
  const emergency = await prisma.emergency.update({
    where: { id: req.params.id },
    data: { locationLat: location.latitude, locationLng: location.longitude },
  });
  getIO()?.emit('emergency:location_update', { emergencyId: emergency.id, location });
  ok(res, emergency);
};

export const cancelEmergency = async (req: AuthRequest, res: Response): Promise<void> => {
  const emergency = await prisma.emergency.findFirst({ where: { id: req.params.id, userId: req.user!.userId } });
  if (!emergency) { notFound(res); return; }
  const updated = await prisma.emergency.update({ where: { id: emergency.id }, data: { status: 'CANCELLED' } });
  ok(res, updated, 'Emergencia cancelada');
};

export const notifyContacts = async (req: AuthRequest, res: Response): Promise<void> => {
  const contacts = await prisma.emergencyContact.findMany({ where: { userId: req.user!.userId } });
  // In production: send SMS/WhatsApp via Twilio
  ok(res, { notified: contacts.length }, `${contacts.length} contacto(s) notificado(s)`);
};

export const getHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  const history = await prisma.emergency.findMany({
    where: { userId: req.user!.userId },
    orderBy: { createdAt: 'desc' },
  });
  ok(res, history);
};
