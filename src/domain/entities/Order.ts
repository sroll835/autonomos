import { Coordinates } from './User';
import { Product } from './Product';

/** Estados posibles de un pedido */
export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED';

/** Método de pago */
export type PaymentMethod = 'TARJETA' | 'PSE' | 'NEQUI' | 'EFECTIVO';

/** Entidad de pedido del marketplace */
export interface Order {
  id: string;
  userId: string;
  items: Array<{ product: Product; quantity: number; price: number }>;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  total: number;
  deliveryAddress: string;
  deliveryLocation: Coordinates;
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
  trackingCode?: string;
}
