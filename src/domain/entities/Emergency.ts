import { Coordinates } from './User';

/** Estado de la emergencia */
export type EmergencyStatus =
  | 'PENDING'
  | 'DISPATCHED'
  | 'IN_ROUTE'
  | 'ARRIVED'
  | 'RESOLVED';

/** Tipo de emergencia */
export type EmergencyType = 'MEDICA' | 'ACCIDENTE' | 'INCENDIO' | 'OTRO';

/** Entidad de emergencia SOS */
export interface Emergency {
  id: string;
  userId: string;
  type: EmergencyType;
  status: EmergencyStatus;
  location: Coordinates;
  address: string;
  description?: string;
  ambulanceId?: string;
  ambulanceDriver?: string;
  eta?: number;
  createdAt: string;
  resolvedAt?: string;
}

/** Contacto de emergencia del usuario */
export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}
