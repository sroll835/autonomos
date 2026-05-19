import AsyncStorage from '@react-native-async-storage/async-storage';

/** Claves de almacenamiento local (datos no sensibles) */
export const LOCAL_KEYS = {
  USER_PREFERENCES: 'user_preferences',
  CART: 'cart_items',
  ONBOARDING_DONE: 'onboarding_done',
  LANGUAGE: 'language',
  LAST_LOCATION: 'last_location',
} as const;

/** Almacenamiento local para datos no sensibles */
export const localStorage = {
  async set<T>(key: string, value: T): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },
  async get<T>(key: string): Promise<T | null> {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  },
  async delete(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },
  async clear(): Promise<void> {
    await AsyncStorage.clear();
  },
};
