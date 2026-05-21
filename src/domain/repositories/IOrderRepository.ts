import { Order, OrderStatus, PaymentMethod } from '../entities/Order';
import { Coordinates } from '../entities/User';

export interface CreateOrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface CreateOrderDTO {
  items: CreateOrderItem[];
  paymentMethod: PaymentMethod;
  deliveryAddress: string;
  deliveryLocation: Coordinates;
}

/** Contrato del repositorio de pedidos */
export interface IOrderRepository {
  createOrder(data: CreateOrderDTO): Promise<Order>;
  getOrders(userId: string): Promise<Order[]>;
  getOrderById(id: string): Promise<Order>;
  cancelOrder(id: string): Promise<Order>;
  trackOrder(id: string): Promise<Order>;
}
