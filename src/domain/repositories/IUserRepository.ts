/** DTOs y contrato del repositorio de perfil de usuario (datos no-auth) */

export interface AddVehicleDTO {
  brand: string;
  model: string;
  year: number;
  plate: string;
  color: string;
}

export interface AddPaymentMethodDTO {
  type: string;
  last4?: string;
  brand?: string;
  cardHolder?: string;
  expiry?: string;
  phone?: string;
  bank?: string;
}

export interface IUserRepository {
  getVehicles(): Promise<any>;
  addVehicle(dto: AddVehicleDTO): Promise<any>;
  removeVehicle(id: string): Promise<void>;

  getDocuments(): Promise<any>;
  uploadDocument(form: FormData): Promise<any>;
  deleteDocument(id: string): Promise<void>;

  getMyReviews(): Promise<any>;

  getPaymentMethods(): Promise<any>;
  addPaymentMethod(dto: AddPaymentMethodDTO): Promise<any>;
  removePaymentMethod(id: string): Promise<void>;
}
