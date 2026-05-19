import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { ok, created, notFound, badRequest, forbidden } from '../utils/response';
import { getIO } from '../services/socket.service';

const prisma = new PrismaClient();

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  const { items, paymentMethod, deliveryAddress, deliveryLocation } = req.body;

  if (!items?.length) { badRequest(res, 'El pedido debe tener al menos un ítem'); return; }

  const productIds = items.map((i: any) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });

  let total = 0;
  const orderItems = items.map((item: any) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) throw new Error(`Producto ${item.productId} no encontrado`);
    const price = product.discountPrice ?? product.price;
    total += price * item.quantity;
    return { productId: item.productId, quantity: item.quantity, price };
  });

  const order = await prisma.order.create({
    data: {
      userId: req.user!.userId,
      paymentMethod,
      deliveryAddress,
      deliveryLat: deliveryLocation.latitude,
      deliveryLng: deliveryLocation.longitude,
      total,
      items: { create: orderItems },
    },
    include: { items: { include: { product: true } } },
  });

  // Notify via socket
  getIO()?.to(`user:${req.user!.userId}`).emit('order:status_update', { orderId: order.id, status: 'PENDING' });

  created(res, order, '¡Pedido creado exitosamente!');
};

export const getOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user!.userId },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  });
  ok(res, orders);
};

export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, userId: req.user!.userId },
    include: { items: { include: { product: true } } },
  });
  if (!order) { notFound(res, 'Pedido no encontrado'); return; }
  ok(res, order);
};

export const cancelOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  const order = await prisma.order.findFirst({ where: { id: req.params.id, userId: req.user!.userId } });
  if (!order) { notFound(res, 'Pedido no encontrado'); return; }
  if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
    badRequest(res, 'Solo se pueden cancelar pedidos pendientes o confirmados');
    return;
  }
  const updated = await prisma.order.update({ where: { id: order.id }, data: { status: 'CANCELLED' } });
  ok(res, updated, 'Pedido cancelado');
};

export const trackOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, userId: req.user!.userId },
    include: { items: { include: { product: true } } },
  });
  if (!order) { notFound(res, 'Pedido no encontrado'); return; }
  ok(res, { ...order, deliveryLocation: { latitude: order.deliveryLat, longitude: order.deliveryLng } });
};
