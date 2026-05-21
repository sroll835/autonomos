import apiClient from '../../infrastructure/api/client';
import { ENDPOINTS } from '../../infrastructure/api/endpoints';
import { IEmergencyRepository, CreateEmergencyDTO } from '../../domain/repositories/IEmergencyRepository';
import { Emergency, EmergencyContact } from '../../domain/entities/Emergency';
import { Coordinates } from '../../domain/entities/User';

export class EmergencyRepositoryImpl implements IEmergencyRepository {
  async create(dto: CreateEmergencyDTO): Promise<Emergency> {
    const { data } = await apiClient.post<Emergency>(ENDPOINTS.EMERGENCY.CREATE, {
      type: dto.type,
      location: dto.location,
      address: dto.address,
    });
    return data;
  }

  async cancel(id: string): Promise<void> {
    await apiClient.post(ENDPOINTS.EMERGENCY.CANCEL(id));
  }

  async updateLocation(id: string, location: Coordinates): Promise<void> {
    await apiClient.patch(ENDPOINTS.EMERGENCY.UPDATE_LOCATION(id), { location });
  }

  async getHistory(): Promise<Emergency[]> {
    const { data } = await apiClient.get<Emergency[]>(ENDPOINTS.EMERGENCY.HISTORY);
    return data;
  }

  async getContacts(): Promise<EmergencyContact[]> {
    const { data } = await apiClient.get<EmergencyContact[]>(ENDPOINTS.USERS.EMERGENCY_CONTACTS);
    return data;
  }
}
