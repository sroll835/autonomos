import { Emergency, EmergencyType } from '../../entities/Emergency';
import { Coordinates } from '../../entities/User';
import { IEmergencyRepository } from '../../repositories/IEmergencyRepository';

/** Caso de uso: activar emergencia SOS */
export class TriggerSOSUseCase {
  constructor(private readonly emergencyRepo: IEmergencyRepository) {}

  async execute(type: EmergencyType, location: Coordinates, address: string): Promise<Emergency> {
    if (!location) throw new Error('Se requiere la ubicación para activar la emergencia.');
    return this.emergencyRepo.create({ type, location, address });
  }
}
