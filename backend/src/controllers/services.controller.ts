import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { ok, created, notFound, badRequest } from '../utils/response';
import { getIO } from '../services/socket.service';

const prisma = new PrismaClient();

export const getNearbyProviders = async (req: Request, res: Response): Promise<void> => {
  const { serviceType, lat, lng } = req.query;
  const providers = await prisma.provider.findMany({
    where: { ...(serviceType && { serviceType: String(serviceType) }) },
    orderBy: { rating: 'desc' },
    take: 20,
  });

  // Haversine distance if coordinates provided
  let result = providers;
  if (lat && lng) {
    result = providers.map((p) => {
      if (!p.locationLat || !p.locationLng) return { ...p, distance: undefined };
      const R = 6371;
      const dLat = ((p.locationLat - Number(lat)) * Math.PI) / 180;
      const dLng = ((p.locationLng - Number(lng)) * Math.PI) / 180;
      const a = Math.sin(dLat / 2) ** 2 + Math.cos((Number(lat) * Math.PI) / 180) * Math.cos((p.locationLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
      const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return { ...p, distance };
    }).sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999));
  }

  ok(res, result.map((p) => ({ ...p, certifications: JSON.parse(p.certifications) })));
};

export const createService = async (req: AuthRequest, res: Response): Promise<void> => {
  const { serviceType, providerId, description, location, address } = req.body;
  const service = await prisma.serviceRequest.create({
    data: {
      userId: req.user!.userId,
      providerId,
      serviceType,
      description,
      locationLat: location.latitude,
      locationLng: location.longitude,
      address,
    },
    include: { provider: true },
  });

  if (providerId) {
    getIO()?.to(`provider:${providerId}`).emit('provider:new_request', { serviceId: service.id });
  }

  created(res, service);
};

export const getServiceById = async (req: AuthRequest, res: Response): Promise<void> => {
  const service = await prisma.serviceRequest.findFirst({
    where: { id: req.params.id, userId: req.user!.userId },
    include: { provider: true, messages: { orderBy: { createdAt: 'asc' } } },
  });
  if (!service) { notFound(res); return; }
  ok(res, service);
};

export const acceptQuote = async (req: AuthRequest, res: Response): Promise<void> => {
  const service = await prisma.serviceRequest.findFirst({ where: { id: req.params.id, userId: req.user!.userId } });
  if (!service) { notFound(res); return; }
  const updated = await prisma.serviceRequest.update({ where: { id: service.id }, data: { status: 'ACCEPTED' } });
  ok(res, updated);
};

export const rejectQuote = async (req: AuthRequest, res: Response): Promise<void> => {
  const service = await prisma.serviceRequest.findFirst({ where: { id: req.params.id, userId: req.user!.userId } });
  if (!service) { notFound(res); return; }
  const updated = await prisma.serviceRequest.update({ where: { id: service.id }, data: { status: 'CANCELLED' } });
  ok(res, updated);
};

export const completeService = async (req: AuthRequest, res: Response): Promise<void> => {
  const { rating, review } = req.body;
  const service = await prisma.serviceRequest.findFirst({ where: { id: req.params.id, userId: req.user!.userId } });
  if (!service) { notFound(res); return; }
  const updated = await prisma.serviceRequest.update({
    where: { id: service.id },
    data: { status: 'COMPLETED', rating, review },
  });
  if (service.providerId && rating) {
    const reviews = await prisma.serviceRequest.aggregate({ where: { providerId: service.providerId, rating: { not: null } }, _avg: { rating: true }, _count: true });
    await prisma.provider.update({ where: { id: service.providerId }, data: { rating: reviews._avg.rating ?? 5, reviewCount: reviews._count } });
    if (review) {
      await prisma.review.create({ data: { userId: req.user!.userId, providerId: service.providerId, serviceType: service.serviceType, rating, comment: review } });
    }
  }
  ok(res, updated);
};

export const cancelService = async (req: AuthRequest, res: Response): Promise<void> => {
  const service = await prisma.serviceRequest.findFirst({ where: { id: req.params.id, userId: req.user!.userId } });
  if (!service) { notFound(res); return; }
  const updated = await prisma.serviceRequest.update({ where: { id: service.id }, data: { status: 'CANCELLED' } });
  ok(res, updated);
};

export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  const messages = await prisma.chatMessage.findMany({
    where: { serviceId: req.params.id },
    orderBy: { createdAt: 'asc' },
  });
  ok(res, messages);
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  const { content, type = 'TEXT' } = req.body;
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId }, select: { name: true, avatar: true } });
  const message = await prisma.chatMessage.create({
    data: { serviceId: req.params.id, senderId: req.user!.userId, senderName: user!.name, senderAvatar: user!.avatar ?? undefined, content, type },
  });
  getIO()?.to(`service:${req.params.id}`).emit('service:message', message);
  created(res, message);
};
