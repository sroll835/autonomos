import { ServiceRequest, ChatMessage } from '../entities/Service';
import { Provider } from '../entities/Provider';
import { Coordinates } from '../entities/User';

export interface CreateServiceDTO {
  serviceType: ServiceRequest['serviceType'];
  providerId?: string;
  description: string;
  photos?: string[];
  location: Coordinates;
  address: string;
  towingDetails?: ServiceRequest['towingDetails'];
}

/** Contrato del repositorio de servicios */
export interface IServiceRepository {
  getNearbyProviders(location: Coordinates, serviceType: string): Promise<Provider[]>;
  getProvider(id: string): Promise<Provider>;
  createServiceRequest(data: CreateServiceDTO): Promise<ServiceRequest>;
  getServiceRequest(id: string): Promise<ServiceRequest>;
  getUserServices(userId: string): Promise<ServiceRequest[]>;
  acceptQuote(serviceId: string): Promise<ServiceRequest>;
  rejectQuote(serviceId: string): Promise<ServiceRequest>;
  completeService(serviceId: string, rating: number, review: string): Promise<ServiceRequest>;
  cancelService(serviceId: string): Promise<ServiceRequest>;
  sendMessage(serviceId: string, content: string, type?: ChatMessage['type']): Promise<ChatMessage>;
  getMessages(serviceId: string): Promise<ChatMessage[]>;
}
