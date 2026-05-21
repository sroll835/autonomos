import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/** Claves de almacenamiento seguro */
export const SECURE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_ID: 'user_id',
} as const;

const isWeb = Platform.OS === 'web';

const webStore = {
  async set(key: string, value: string): Promise<void> {
    if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
  },
  async get(key: string): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(key);
  },
  async delete(key: string): Promise<void> {
    if (typeof window !== 'undefined') window.localStorage.removeItem(key);
  },
};

/** Almacenamiento seguro para datos sensibles (tokens) */
export const secureStorage = {
  async set(key: string, value: string): Promise<void> {
    if (isWeb) return webStore.set(key, value);
    await SecureStore.setItemAsync(key, value);
  },
  async get(key: string): Promise<string | null> {
    if (isWeb) return webStore.get(key);
    return SecureStore.getItemAsync(key);
  },
  async delete(key: string): Promise<void> {
    if (isWeb) return webStore.delete(key);
    await SecureStore.deleteItemAsync(key);
  },
  async clearAuth(): Promise<void> {
    await Promise.all([
      this.delete(SECURE_KEYS.ACCESS_TOKEN),
      this.delete(SECURE_KEYS.REFRESH_TOKEN),
      this.delete(SECURE_KEYS.USER_ID),
    ]);
  },
};
