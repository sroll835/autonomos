import { Emergency, EmergencyType } from '../../entities/Emergency';
import { Coordinates } from '../../entities/User';
import apiClient from '../../../infrastructure/api/client';
import { ENDPOINTS } from '../../../infrastructure/api/endpoints';

/** Caso de uso: activar emergencia SOS */
export class TriggerSOSUseCase {
  async execute(type: EmergencyType, location: Coordinates, address: string): Promise<Emergency> {
    if (!location) throw new Error('Se requiere la ubicación para activar la emergencia.');
    const { data } = await apiClient.post<Emergency>(ENDPOINTS.EMERGENCY.CREATE, {
      type, location, address,
    });
    return data;
  }
}
