import { User, UserRole } from '../../domain/entities/User';

interface UserWire {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar?: string | null;
  isVerified: boolean;
  locationLat?: number | null;
  locationLng?: number | null;
  createdAt: string;
  updatedAt: string;
}

const VALID_ROLES = ['CONDUCTOR', 'TALLER', 'AUTONOMO', 'EMPRESA'] as const;

const toRole = (raw: string): UserRole => {
  if ((VALID_ROLES as readonly string[]).includes(raw)) return raw as UserRole;
  if (__DEV__) console.warn(`[userMapper] role desconocido "${raw}" → 'CONDUCTOR'`);
  return 'CONDUCTOR';
};

export const toUser = (raw: UserWire): User => ({
  id: raw.id,
  name: raw.name,
  email: raw.email,
  phone: raw.phone,
  role: toRole(raw.role),
  avatar: raw.avatar ?? undefined,
  isVerified: raw.isVerified,
  location: (raw.locationLat != null && raw.locationLng != null)
    ? { latitude: raw.locationLat, longitude: raw.locationLng }
    : undefined,
  createdAt: raw.createdAt,
  updatedAt: raw.updatedAt,
});
