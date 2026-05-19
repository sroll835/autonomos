import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { ok, created, notFound, badRequest } from '../utils/response';

const prisma = new PrismaClient();

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, phone, avatar } = req.body;
  const user = await prisma.user.update({
    where: { id: req.user!.userId },
    data: { ...(name && { name }), ...(phone && { phone }), ...(avatar && { avatar }) },
    select: { id: true, name: true, email: true, phone: true, role: true, avatar: true, isVerified: true, createdAt: true, updatedAt: true },
  });
  ok(res, user, 'Perfil actualizado');
};

// Vehicles
export const getVehicles = async (req: AuthRequest, res: Response): Promise<void> => {
  const vehicles = await prisma.vehicle.findMany({ where: { userId: req.user!.userId } });
  ok(res, vehicles);
};

export const addVehicle = async (req: AuthRequest, res: Response): Promise<void> => {
  const { brand, model, year, plate, color } = req.body;
  const vehicle = await prisma.vehicle.create({
    data: { userId: req.user!.userId, brand, model, year: Number(year), plate, color: color ?? '' },
  });
  created(res, vehicle);
};

export const deleteVehicle = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const vehicle = await prisma.vehicle.findFirst({ where: { id, userId: req.user!.userId } });
  if (!vehicle) { notFound(res, 'Vehículo no encontrado'); return; }
  await prisma.vehicle.delete({ where: { id } });
  ok(res, null, 'Vehículo eliminado');
};

// Emergency contacts
export const getEmergencyContacts = async (req: AuthRequest, res: Response): Promise<void> => {
  const contacts = await prisma.emergencyContact.findMany({ where: { userId: req.user!.userId } });
  ok(res, contacts);
};

export const addEmergencyContact = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, phone, relationship } = req.body;
  const contact = await prisma.emergencyContact.create({
    data: { userId: req.user!.userId, name, phone, relationship },
  });
  created(res, contact);
};

export const deleteEmergencyContact = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const contact = await prisma.emergencyContact.findFirst({ where: { id, userId: req.user!.userId } });
  if (!contact) { notFound(res, 'Contacto no encontrado'); return; }
  await prisma.emergencyContact.delete({ where: { id } });
  ok(res, null, 'Contacto eliminado');
};

// Payment methods
export const getPaymentMethods = async (req: AuthRequest, res: Response): Promise<void> => {
  const methods = await prisma.paymentMethod.findMany({ where: { userId: req.user!.userId } });
  ok(res, methods);
};

export const addPaymentMethod = async (req: AuthRequest, res: Response): Promise<void> => {
  const { type, last4, brand, cardHolder, expiry, phone, bank } = req.body;
  const method = await prisma.paymentMethod.create({
    data: { userId: req.user!.userId, type, last4, brand, cardHolder, expiry, phone, bank },
  });
  created(res, method);
};

export const deletePaymentMethod = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const method = await prisma.paymentMethod.findFirst({ where: { id, userId: req.user!.userId } });
  if (!method) { notFound(res, 'Método no encontrado'); return; }
  await prisma.paymentMethod.delete({ where: { id } });
  ok(res, null, 'Método eliminado');
};

// Notifications
export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user!.userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  ok(res, notifications);
};

export const markNotificationRead = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  await prisma.notification.updateMany({ where: { id, userId: req.user!.userId }, data: { read: true } });
  ok(res, null);
};

export const markAllNotificationsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  await prisma.notification.updateMany({ where: { userId: req.user!.userId }, data: { read: true } });
  ok(res, null);
};

// Reviews
export const getMyReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  const reviews = await prisma.review.findMany({
    where: { userId: req.user!.userId },
    include: { provider: { select: { name: true, avatar: true } } },
    orderBy: { createdAt: 'desc' },
  });
  ok(res, reviews);
};

// Documents
export const getDocuments = async (req: AuthRequest, res: Response): Promise<void> => {
  const docs = await prisma.document.findMany({ where: { userId: req.user!.userId } });
  ok(res, docs);
};

export const deleteDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  await prisma.document.deleteMany({ where: { id, userId: req.user!.userId } });
  ok(res, null, 'Documento eliminado');
};
