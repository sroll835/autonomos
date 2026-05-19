import bcrypt from 'bcryptjs';
import { env } from '../config/env';

export const hashPassword = (plain: string): Promise<string> =>
  bcrypt.hash(plain, env.BCRYPT_ROUNDS);

export const comparePassword = (plain: string, hash: string): Promise<boolean> =>
  bcrypt.compare(plain, hash);

export const validatePasswordStrength = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 8) return { valid: false, message: 'Mínimo 8 caracteres' };
  if (!/[A-Z]/.test(password)) return { valid: false, message: 'Debe tener al menos una mayúscula' };
  if (!/[0-9]/.test(password)) return { valid: false, message: 'Debe tener al menos un número' };
  return { valid: true };
};
