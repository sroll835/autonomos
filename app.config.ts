import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'AUTONOMOS',
  slug: 'autonomos',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'autonomos',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/images/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#0B1C3D',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.autonomos.app',
    infoPlist: {
      NSLocationWhenInUseUsageDescription: 'AUTONOMOS necesita tu ubicación para mostrarte proveedores cercanos.',
      NSLocationAlwaysUsageDescription: 'AUTONOMOS necesita tu ubicación en segundo plano para tracking activo.',
      NSCameraUsageDescription: 'AUTONOMOS necesita la cámara para subir fotos de tu vehículo.',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#0B1C3D',
    },
    package: 'com.autonomos.app',
    permissions: [
      'ACCESS_COARSE_LOCATION',
      'ACCESS_FINE_LOCATION',
      'ACCESS_BACKGROUND_LOCATION',
      'CAMERA',
      'READ_EXTERNAL_STORAGE',
      'WRITE_EXTERNAL_STORAGE',
    ],
  },
  web: {
    bundler: 'metro',
    output: 'single',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-font',
    'expo-secure-store',
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission: 'AUTONOMOS necesita acceso a tu ubicación.',
      },
    ],
    [
      'expo-notifications',
      {
        icon: './assets/images/notification-icon.png',
        color: '#E8AA20',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    apiUrl: process.env.API_URL,
    socketUrl: process.env.SOCKET_URL,
    googleMapsKey: process.env.GOOGLE_MAPS_KEY,
    eas: {
      projectId: process.env.EAS_PROJECT_ID,
    },
  },
});
