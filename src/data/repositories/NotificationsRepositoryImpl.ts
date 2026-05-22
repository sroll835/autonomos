import apiClient from '../../infrastructure/api/client';
import { ENDPOINTS } from '../../infrastructure/api/endpoints';
import { INotificationsRepository } from '../../domain/repositories/INotificationsRepository';

export class NotificationsRepositoryImpl implements INotificationsRepository {
  async list(): Promise<any> {
    const { data } = await apiClient.get(ENDPOINTS.NOTIFICATIONS.LIST);
    return data;
  }

  async markRead(id: string): Promise<void> {
    await apiClient.patch(ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
  }

  async markAllRead(): Promise<void> {
    await apiClient.patch(ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
  }
}
