/** Coordenadas geográficas */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/** Roles posibles del usuario en la plataforma */
export type UserRole = 'CONDUCTOR' | 'TALLER' | 'AUTONOMO' | 'EMPRESA';

/** Entidad principal del usuario */
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  isVerified: boolean;
  location?: Coordinates;
  createdAt: string;
  updatedAt: string;
}

/** Tokens de autenticación */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/** Respuesta completa de autenticación */
export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}
