import apiClient from '../../infrastructure/api/client';
import { ENDPOINTS } from '../../infrastructure/api/endpoints';
import { IUserRepository, AddVehicleDTO, AddPaymentMethodDTO } from '../../domain/repositories/IUserRepository';

export class UserRepositoryImpl implements IUserRepository {
  async getVehicles(): Promise<any> {
    const { data } = await apiClient.get(ENDPOINTS.USERS.VEHICLES);
    return data;
  }

  async addVehicle(dto: AddVehicleDTO): Promise<any> {
    const { data } = await apiClient.post(ENDPOINTS.USERS.VEHICLES, dto);
    return data;
  }

  async removeVehicle(id: string): Promise<void> {
    await apiClient.delete(`${ENDPOINTS.USERS.VEHICLES}/${id}`);
  }

  async getDocuments(): Promise<any> {
    const { data } = await apiClient.get(ENDPOINTS.USERS.DOCUMENTS);
    return data;
  }

  async uploadDocument(form: FormData): Promise<any> {
    const { data } = await apiClient.post(ENDPOINTS.USERS.DOCUMENTS, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  }

  async deleteDocument(id: string): Promise<void> {
    await apiClient.delete(`${ENDPOINTS.USERS.DOCUMENTS}/${id}`);
  }

  async getMyReviews(): Promise<any> {
    const { data } = await apiClient.get(ENDPOINTS.USERS.REVIEWS);
    return data;
  }

  async getPaymentMethods(): Promise<any> {
    const { data } = await apiClient.get(ENDPOINTS.USERS.PAYMENT_METHODS);
    return data;
  }

  async addPaymentMethod(dto: AddPaymentMethodDTO): Promise<any> {
    const { data } = await apiClient.post(ENDPOINTS.USERS.PAYMENT_METHODS, dto);
    return data;
  }

  async removePaymentMethod(id: string): Promise<void> {
    await apiClient.delete(`${ENDPOINTS.USERS.PAYMENT_METHODS}/${id}`);
  }
}
