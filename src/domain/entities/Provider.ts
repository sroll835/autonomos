import { Coordinates } from './User';

/** Tipos de servicio que puede ofrecer un proveedor */
export type ServiceType = 'MECANICO' | 'GRUA' | 'AMBULANCIA' | 'LOGISTICA';

/** Entidad de proveedor de servicios */
export interface Provider {
  id: string;
  name: string;
  avatar?: string;
  serviceType: ServiceType;
  rating: number;
  reviewCount: number;
  location: Coordinates;
  distance?: number;
  isAvailable: boolean;
  certifications: string[];
  pricePerHour?: number;
  vehicle?: {
    brand: string;
    model: string;
    plate: string;
    color: string;
  };
  eta?: number;
}

/** Reseña de un proveedor */
export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
}
