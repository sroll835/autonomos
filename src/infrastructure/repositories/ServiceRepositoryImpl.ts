import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { IServiceRepository, CreateServiceDTO } from '../../domain/repositories/IServiceRepository';
import { ServiceRequest, ChatMessage } from '../../domain/entities/Service';
import { Provider } from '../../domain/entities/Provider';
import { Coordinates } from '../../domain/entities/User';

export class ServiceRepositoryImpl implements IServiceRepository {
  async getNearbyProviders(location: Coordinates, serviceType: string): Promise<Provider[]> {
    const { data } = await apiClient.get<Provider[]>(ENDPOINTS.SERVICES.NEARBY_PROVIDERS, {
      params: { lat: location.latitude, lng: location.longitude, serviceType },
    });
    return data;
  }

  async createServiceRequest(dto: CreateServiceDTO): Promise<ServiceRequest> {
    const { data } = await apiClient.post<ServiceRequest>(ENDPOINTS.SERVICES.CREATE, dto);
    return data;
  }

  async getServiceRequest(id: string): Promise<ServiceRequest> {
    const { data } = await apiClient.get<ServiceRequest>(ENDPOINTS.SERVICES.DETAIL(id));
    return data;
  }

  async getUserServices(_userId: string): Promise<ServiceRequest[]> {
    const { data } = await apiClient.get<ServiceRequest[]>(ENDPOINTS.SERVICES.LIST);
    return data;
  }

  async acceptQuote(serviceId: string): Promise<ServiceRequest> {
    const { data } = await apiClient.post<ServiceRequest>(ENDPOINTS.SERVICES.ACCEPT_QUOTE(serviceId));
    return data;
  }

  async rejectQuote(serviceId: string): Promise<ServiceRequest> {
    const { data } = await apiClient.post<ServiceRequest>(ENDPOINTS.SERVICES.REJECT_QUOTE(serviceId));
    return data;
  }

  async completeService(serviceId: string, rating: number, review: string): Promise<ServiceRequest> {
    const { data } = await apiClient.post<ServiceRequest>(ENDPOINTS.SERVICES.COMPLETE(serviceId), { rating, review });
    return data;
  }

  async cancelService(serviceId: string): Promise<ServiceRequest> {
    const { data } = await apiClient.post<ServiceRequest>(ENDPOINTS.SERVICES.CANCEL(serviceId));
    return data;
  }

  async sendMessage(serviceId: string, content: string, type: ChatMessage['type'] = 'TEXT'): Promise<ChatMessage> {
    const { data } = await apiClient.post<ChatMessage>(ENDPOINTS.SERVICES.MESSAGES(serviceId), { content, type });
    return data;
  }

  async getMessages(serviceId: string): Promise<ChatMessage[]> {
    const { data } = await apiClient.get<ChatMessage[]>(ENDPOINTS.SERVICES.MESSAGES(serviceId));
    return data;
  }
}
