import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { secureStorage, SECURE_KEYS } from '../storage/secureStorage';
import { IAuthRepository, RegisterDTO } from '../../domain/repositories/IAuthRepository';
import { User, AuthResponse, AuthTokens } from '../../domain/entities/User';

/** Implementación del repositorio de autenticación */
export class AuthRepositoryImpl implements IAuthRepository {
  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>(ENDPOINTS.AUTH.LOGIN, { email, password });
    await this._saveTokens(data.tokens);
    await secureStorage.set(SECURE_KEYS.USER_ID, data.user.id);
    return data;
  }

  async register(dto: RegisterDTO): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>(ENDPOINTS.AUTH.REGISTER, dto);
    await this._saveTokens(data.tokens);
    await secureStorage.set(SECURE_KEYS.USER_ID, data.user.id);
    return data;
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
    } finally {
      await secureStorage.clearAuth();
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const { data } = await apiClient.post<AuthTokens>(ENDPOINTS.AUTH.REFRESH, { refreshToken });
    await secureStorage.set(SECURE_KEYS.ACCESS_TOKEN, data.accessToken);
    return data;
  }

  async verifyOtp(phone: string, otp: string): Promise<boolean> {
    const { data } = await apiClient.post<{ verified: boolean }>(ENDPOINTS.AUTH.VERIFY_OTP, { phone, otp });
    return data.verified;
  }

  async sendOtp(phone: string): Promise<void> {
    await apiClient.post(ENDPOINTS.AUTH.SEND_OTP, { phone });
  }

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  }

  async resetPassword(token: string, password: string): Promise<void> {
    await apiClient.post(ENDPOINTS.AUTH.RESET_PASSWORD, { token, password });
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data } = await apiClient.get<User>(ENDPOINTS.AUTH.ME);
      return data;
    } catch {
      return null;
    }
  }

  async updateProfile(dto: Partial<User>): Promise<User> {
    const { data } = await apiClient.patch<User>(ENDPOINTS.USERS.UPDATE, dto);
    return data;
  }

  private async _saveTokens(tokens: AuthTokens): Promise<void> {
    await Promise.all([
      secureStorage.set(SECURE_KEYS.ACCESS_TOKEN, tokens.accessToken),
      secureStorage.set(SECURE_KEYS.REFRESH_TOKEN, tokens.refreshToken),
    ]);
  }
}
