import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';
import { secureStorage, SECURE_KEYS } from '../storage/secureStorage';

const BASE_URL = Constants.expoConfig?.extra?.apiUrl ?? 'http://localhost:6000/v1';

/** Instancia principal de Axios con interceptores de autenticación y retry */
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Accept-Language': 'es-CO',
  },
});

// Interceptor de request: adjunta Bearer token automáticamente
apiClient.interceptors.request.use(
  async (config) => {
    const token = await secureStorage.get(SECURE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Logging solo en desarrollo
    if (__DEV__) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token!);
  });
  failedQueue = [];
};

// Interceptor de response: desempaca wrapper { success, data } y refresca token si 401
apiClient.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body && typeof body === 'object' && body.success === true && 'data' in body) {
      response.data = body.data;
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await secureStorage.get(SECURE_KEYS.REFRESH_TOKEN);
        const response = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        const body = response.data;
        const tokens = body && body.success === true && body.data ? body.data : body;
        const { accessToken } = tokens;
        await secureStorage.set(SECURE_KEYS.ACCESS_TOKEN, accessToken);
        processQueue(null, accessToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await secureStorage.delete(SECURE_KEYS.ACCESS_TOKEN);
        await secureStorage.delete(SECURE_KEYS.REFRESH_TOKEN);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(mapApiError(error));
  }
);

/** Mapea errores HTTP a mensajes en español */
export const mapApiError = (error: AxiosError): Error => {
  const status = error.response?.status;
  const messages: Record<number, string> = {
    400: 'Solicitud inválida. Revisa los datos ingresados.',
    401: 'Sesión expirada. Inicia sesión de nuevo.',
    403: 'No tienes permisos para esta acción.',
    404: 'El recurso solicitado no existe.',
    409: 'Ya existe un registro con esos datos.',
    422: 'Los datos enviados no son válidos.',
    429: 'Demasiadas solicitudes. Espera un momento.',
    500: 'Error del servidor. Intenta más tarde.',
    503: 'Servicio no disponible temporalmente.',
  };
  const message = status ? messages[status] ?? 'Ocurrió un error inesperado.' : 'Sin conexión a internet.';
  return new Error(message);
};

export default apiClient;
