import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { IOrderRepository, CreateOrderDTO } from '../../domain/repositories/IOrderRepository';
import { Order } from '../../domain/entities/Order';

export class OrderRepositoryImpl implements IOrderRepository {
  async createOrder(data: CreateOrderDTO): Promise<Order> {
    const { data: order } = await apiClient.post<Order>(ENDPOINTS.ORDERS.CREATE, data);
    return order;
  }

  async getOrders(_userId: string): Promise<Order[]> {
    const { data } = await apiClient.get<Order[]>(ENDPOINTS.ORDERS.LIST);
    return data;
  }

  async getOrderById(id: string): Promise<Order> {
    const { data } = await apiClient.get<Order>(ENDPOINTS.ORDERS.DETAIL(id));
    return data;
  }

  async cancelOrder(id: string): Promise<Order> {
    const { data } = await apiClient.post<Order>(ENDPOINTS.ORDERS.CANCEL(id));
    return data;
  }

  async trackOrder(id: string): Promise<Order> {
    const { data } = await apiClient.get<Order>(ENDPOINTS.ORDERS.TRACK(id));
    return data;
  }
}
