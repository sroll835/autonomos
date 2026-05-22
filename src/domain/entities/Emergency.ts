import { Coordinates } from './User';

/** Estados reales de una emergencia (emitidos por backend). */
export type EmergencyStatus = 'ACTIVE' | 'CANCELLED';

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
  ambulanceDriver?: string;
  ambulancePhone?: string;
  eta?: number;
  createdAt: string;
  updatedAt: string;
}

/** Contacto de emergencia del usuario */
export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}
