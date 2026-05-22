import apiClient from '../../infrastructure/api/client';
import { ENDPOINTS } from '../../infrastructure/api/endpoints';
import { secureStorage, SECURE_KEYS } from '../../infrastructure/storage/secureStorage';
import { IAuthRepository, RegisterDTO } from '../../domain/repositories/IAuthRepository';
import { User, AuthResponse, AuthTokens } from '../../domain/entities/User';
import { toUser } from '../mappers/userMapper';

/** Implementación del repositorio de autenticación */
export class AuthRepositoryImpl implements IAuthRepository {
  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await apiClient.post(ENDPOINTS.AUTH.LOGIN, { email, password });
    const user = toUser(data.user);
    await this._saveTokens(data.tokens);
    await secureStorage.set(SECURE_KEYS.USER_ID, user.id);
    return { user, tokens: data.tokens };
  }

  async register(dto: RegisterDTO): Promise<AuthResponse> {
    const { data } = await apiClient.post(ENDPOINTS.AUTH.REGISTER, dto);
    const user = toUser(data.user);
    await this._saveTokens(data.tokens);
    await secureStorage.set(SECURE_KEYS.USER_ID, user.id);
    return { user, tokens: data.tokens };
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
      const { data } = await apiClient.get(ENDPOINTS.AUTH.ME);
      return toUser(data);
    } catch {
      return null;
    }
  }

  async updateProfile(dto: Partial<User>): Promise<User> {
    const { data } = await apiClient.patch(ENDPOINTS.USERS.UPDATE, dto);
    return toUser(data);
  }

  async uploadAvatar(form: FormData): Promise<{ url: string }> {
    const { data } = await apiClient.post<{ url: string }>(ENDPOINTS.USERS.AVATAR, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  }

  private async _saveTokens(tokens: AuthTokens): Promise<void> {
    await Promise.all([
      secureStorage.set(SECURE_KEYS.ACCESS_TOKEN, tokens.accessToken),
      secureStorage.set(SECURE_KEYS.REFRESH_TOKEN, tokens.refreshToken),
    ]);
  }
}
