import { Emergency, EmergencyContact, EmergencyType } from '../entities/Emergency';
import { Coordinates } from '../entities/User';

export interface CreateEmergencyDTO {
  type: EmergencyType;
  location: Coordinates;
  address: string;
}

export interface AddEmergencyContactDTO {
  name: string;
  phone: string;
  relationship: string;
}

/** Contrato del repositorio de emergencias SOS */
export interface IEmergencyRepository {
  create(dto: CreateEmergencyDTO): Promise<Emergency>;
  cancel(id: string): Promise<void>;
  updateLocation(id: string, location: Coordinates): Promise<void>;
  notifyContacts(id: string): Promise<void>;
  getHistory(): Promise<Emergency[]>;
  getContacts(): Promise<EmergencyContact[]>;
  addContact(dto: AddEmergencyContactDTO): Promise<EmergencyContact>;
  removeContact(id: string): Promise<void>;
}
