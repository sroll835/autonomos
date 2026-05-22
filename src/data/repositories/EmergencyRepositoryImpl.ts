import apiClient from '../../infrastructure/api/client';
import { ENDPOINTS } from '../../infrastructure/api/endpoints';
import { IEmergencyRepository, CreateEmergencyDTO, AddEmergencyContactDTO } from '../../domain/repositories/IEmergencyRepository';
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

  async notifyContacts(id: string): Promise<void> {
    await apiClient.post(ENDPOINTS.EMERGENCY.NOTIFY_CONTACTS(id));
  }

  async getHistory(): Promise<Emergency[]> {
    const { data } = await apiClient.get<Emergency[]>(ENDPOINTS.EMERGENCY.HISTORY);
    return data;
  }

  async getContacts(): Promise<EmergencyContact[]> {
    const { data } = await apiClient.get<EmergencyContact[]>(ENDPOINTS.USERS.EMERGENCY_CONTACTS);
    return data;
  }

  async addContact(dto: AddEmergencyContactDTO): Promise<EmergencyContact> {
    const { data } = await apiClient.post<EmergencyContact>(ENDPOINTS.USERS.EMERGENCY_CONTACTS, {
      name: dto.name,
      phone: dto.phone,
      relationship: dto.relationship,
    });
    return data;
  }

  async removeContact(id: string): Promise<void> {
    await apiClient.delete(`${ENDPOINTS.USERS.EMERGENCY_CONTACTS}/${id}`);
  }
}
