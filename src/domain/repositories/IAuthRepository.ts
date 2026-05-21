import { User, AuthResponse, AuthTokens } from '../entities/User';

/** Contrato del repositorio de autenticación */
export interface IAuthRepository {
  login(email: string, password: string): Promise<AuthResponse>;
  register(data: RegisterDTO): Promise<AuthResponse>;
  logout(): Promise<void>;
  refreshToken(refreshToken: string): Promise<AuthTokens>;
  verifyOtp(phone: string, otp: string): Promise<boolean>;
  sendOtp(phone: string): Promise<void>;
  forgotPassword(email: string): Promise<void>;
  resetPassword(token: string, password: string): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  updateProfile(data: Partial<User>): Promise<User>;
  uploadAvatar(form: FormData): Promise<{ url: string }>;
}

export interface RegisterDTO {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: User['role'];
}
