import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ok, notFound } from '../utils/response';

const prisma = new PrismaClient();

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  const { page = '1', limit = '10', search = '', category, condition, origin, minPrice, maxPrice } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const where = {
    ...(search && { OR: [{ name: { contains: String(search) } }, { brand: { contains: String(search) } }] }),
    ...(category && { category: String(category) }),
    ...(condition && { condition: String(condition) }),
    ...(origin && { origin: String(origin) }),
    ...(minPrice || maxPrice ? { price: { ...(minPrice && { gte: Number(minPrice) }), ...(maxPrice && { lte: Number(maxPrice) }) } } : {}),
  };

  const [data, total] = await Promise.all([
    prisma.product.findMany({ where, skip, take: Number(limit), orderBy: { createdAt: 'desc' } }),
    prisma.product.count({ where }),
  ]);

  ok(res, {
    data: data.map((p) => ({ ...p, images: JSON.parse(p.images) })),
    total,
    page: Number(page),
    limit: Number(limit),
    hasMore: skip + data.length < total,
  });
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  const product = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!product) { notFound(res); return; }
  ok(res, { ...product, images: JSON.parse(product.images) });
};
