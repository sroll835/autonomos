import { Coordinates } from './User';
import { Provider } from './Provider';

/** Estados de una solicitud de servicio */
export type ServiceStatus =
  | 'PENDING'
  | 'QUOTED'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

/** Tipo de vehículo para grúa */
export type VehicleType = 'MOTO' | 'CARRO' | 'CAMION';

/** Tipo de problema para grúa */
export type ProblemType = 'ACCIDENTE' | 'AVERIA' | 'TRASLADO';

/** Solicitud de grúa */
export interface TowingRequest {
  vehicleType: VehicleType;
  problemType: ProblemType;
  origin: Coordinates;
  destination?: Coordinates;
  estimatedDistance: number;
}

/** Entidad de solicitud de servicio */
export interface ServiceRequest {
  id: string;
  userId: string;
  providerId?: string;
  provider?: Provider;
  serviceType: 'MECANICO' | 'GRUA' | 'AMBULANCIA' | 'LOGISTICA';
  status: ServiceStatus;
  description: string;
  photos?: string[];
  location: Coordinates;
  address: string;
  quotedPrice?: number;
  finalPrice?: number;
  towingDetails?: TowingRequest;
  createdAt: string;
  updatedAt: string;
  rating?: number;
  review?: string;
}

/** Mensaje del chat de servicio */
export interface ChatMessage {
  id: string;
  serviceId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'LOCATION';
  createdAt: string;
  read: boolean;
}
