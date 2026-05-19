import { Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { ok, created, badRequest, unauthorized, conflict, serverError } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

const LOCKOUT_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export const registerSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().toLowerCase(),
  phone: z.string().min(7).max(20).default(''),
  password: z.string().min(8).max(128),
  role: z.enum(['CONDUCTOR', 'TALLER', 'AUTONOMO', 'EMPRESA']).default('CONDUCTOR'),
});

export const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
});

export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, phone, password, role } = req.body;

  const strength = validatePasswordStrength(password);
  if (!strength.valid) { badRequest(res, strength.message!); return; }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) { conflict(res, 'Ya existe una cuenta con ese correo'); return; }

  const hashed = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email, phone, password: hashed, role },
    select: { id: true, name: true, email: true, phone: true, role: true, avatar: true, isVerified: true, createdAt: true, updatedAt: true },
  });

  const tokens = await _issueTokens(user.id, user.role);
  created(res, { user, tokens }, 'Cuenta creada exitosamente');
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) { unauthorized(res, 'Credenciales incorrectas'); return; }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const mins = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    unauthorized(res, `Cuenta bloqueada. Intenta en ${mins} minutos`);
    return;
  }

  const valid = await comparePassword(password, user.password);
  if (!valid) {
    const fails = user.failedLogins + 1;
    const lockoutData = fails >= LOCKOUT_ATTEMPTS
      ? { failedLogins: 0, lockedUntil: new Date(Date.now() + LOCKOUT_MINUTES * 60000) }
      : { failedLogins: fails };
    await prisma.user.update({ where: { id: user.id }, data: lockoutData });
    const remaining = LOCKOUT_ATTEMPTS - fails;
    const msg = fails >= LOCKOUT_ATTEMPTS
      ? `Cuenta bloqueada por ${LOCKOUT_MINUTES} minutos`
      : `Credenciales incorrectas. ${remaining} intento(s) restante(s)`;
    unauthorized(res, msg);
    return;
  }

  await prisma.user.update({ where: { id: user.id }, data: { failedLogins: 0, lockedUntil: null } });

  const tokens = await _issueTokens(user.id, user.role);
  const { password: _, failedLogins: __, lockedUntil: ___, ...safeUser } = user;
  ok(res, { user: safeUser, tokens });
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;
  if (!refreshToken) { badRequest(res, 'refreshToken requerido'); return; }

  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    unauthorized(res, 'Refresh token inválido o expirado');
    return;
  }

  let payload;
  try { payload = verifyRefreshToken(refreshToken); }
  catch { unauthorized(res, 'Token inválido'); return; }

  // Rotate refresh token
  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });
  const tokens = await _issueTokens(payload.userId, payload.role);
  ok(res, tokens);
};

export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await prisma.refreshToken.updateMany({ where: { token: refreshToken }, data: { revoked: true } });
  }
  ok(res, null, 'Sesión cerrada');
};

export const me = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { id: true, name: true, email: true, phone: true, role: true, avatar: true, isVerified: true, locationLat: true, locationLng: true, createdAt: true, updatedAt: true },
  });
  if (!user) { unauthorized(res); return; }
  ok(res, user);
};

const _issueTokens = async (userId: string, role: string) => {
  const accessToken = signAccessToken({ userId, role });
  const refreshToken = signRefreshToken({ userId, role });
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({ data: { token: refreshToken, userId, expiresAt } });
  return { accessToken, refreshToken, expiresIn: 900 };
};
