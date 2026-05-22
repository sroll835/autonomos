import { Emergency, EmergencyType, EmergencyStatus } from '../../domain/entities/Emergency';

interface EmergencyWire {
  id: string;
  userId: string;
  type: string;
  status: string;
  locationLat: number;
  locationLng: number;
  location?: { latitude: number; longitude: number };
  address: string;
  eta?: number | null;
  ambulanceDriver?: string | null;
  ambulancePhone?: string | null;
  createdAt: string;
  updatedAt: string;
}

const VALID_TYPES = ['MEDICA', 'ACCIDENTE', 'INCENDIO', 'OTRO'] as const;
const VALID_STATUSES = ['ACTIVE', 'CANCELLED'] as const;

const toType = (raw: string): EmergencyType => {
  if ((VALID_TYPES as readonly string[]).includes(raw)) return raw as EmergencyType;
  if (__DEV__) console.warn(`[emergencyMapper] type desconocido "${raw}" → 'OTRO'`);
  return 'OTRO';
};

const toStatus = (raw: string): EmergencyStatus => {
  if ((VALID_STATUSES as readonly string[]).includes(raw)) return raw as EmergencyStatus;
  if (__DEV__) console.warn(`[emergencyMapper] status desconocido "${raw}" → 'ACTIVE' (fail-safe pánico)`);
  return 'ACTIVE';
};

export const toEmergency = (raw: EmergencyWire): Emergency => ({
  id: raw.id,
  userId: raw.userId,
  type: toType(raw.type),
  status: toStatus(raw.status),
  location: raw.location ?? { latitude: raw.locationLat, longitude: raw.locationLng },
  address: raw.address,
  eta: raw.eta ?? undefined,
  ambulanceDriver: raw.ambulanceDriver ?? undefined,
  ambulancePhone: raw.ambulancePhone ?? undefined,
  createdAt: raw.createdAt,
  updatedAt: raw.updatedAt,
});
