import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const SOCKET_URL = Constants.expoConfig?.extra?.socketUrl ?? 'wss://socket.autonomos.co';

/** Eventos del socket de la app */
export const SOCKET_EVENTS = {
  // Servicios
  SERVICE_STATUS_UPDATE: 'service:status_update',
  SERVICE_QUOTE_RECEIVED: 'service:quote_received',
  SERVICE_PROVIDER_LOCATION: 'service:provider_location',
  SERVICE_MESSAGE: 'service:message',
  // Pedidos
  ORDER_STATUS_UPDATE: 'order:status_update',
  ORDER_LOCATION_UPDATE: 'order:location_update',
  // Emergencia
  EMERGENCY_ASSIGNED: 'emergency:assigned',
  EMERGENCY_LOCATION_UPDATE: 'emergency:location_update',
  EMERGENCY_STATUS_UPDATE: 'emergency:status_update',
  // Proveedor
  PROVIDER_NEW_REQUEST: 'provider:new_request',
  PROVIDER_LOCATION_SEND: 'provider:location',
} as const;

let socket: Socket | null = null;

/** Inicializa la conexión del socket con autenticación */
export const initSocket = async (): Promise<Socket> => {
  if (socket?.connected) return socket;

  const token = await SecureStore.getItemAsync('access_token');

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    if (__DEV__) console.log('[Socket] Conectado');
  });

  socket.on('disconnect', (reason) => {
    if (__DEV__) console.log('[Socket] Desconectado:', reason);
  });

  socket.on('connect_error', (error) => {
    if (__DEV__) console.error('[Socket] Error de conexión:', error.message);
  });

  return socket;
};

/** Obtiene la instancia del socket activa */
export const getSocket = (): Socket | null => socket;

/** Desconecta el socket */
export const disconnectSocket = (): void => {
  socket?.disconnect();
  socket = null;
};
