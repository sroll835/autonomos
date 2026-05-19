# AUTONOMOS — App Móvil Nativa

> Plataforma tecnológica integral del sector automotriz para Colombia y Latinoamérica.

## Stack

- React Native + Expo SDK 51
- TypeScript strict
- Expo Router v3
- NativeWind v4
- Zustand + React Query v5
- Socket.io-client

## Configuración inicial

### 1. Prerequisitos

```bash
node >= 18
npm >= 9
expo-cli: npm install -g expo-cli
eas-cli: npm install -g eas-cli
```

### 2. Clonar e instalar

```bash
git clone https://github.com/tu-usuario/autonomos.git
cd autonomos
npm install
```

### 3. Variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con tus valores:

| Variable | Descripción |
|----------|-------------|
| `API_URL` | URL del backend AUTONOMOS |
| `SOCKET_URL` | URL del servidor Socket.io |
| `GOOGLE_MAPS_KEY` | API Key de Google Maps |
| `EAS_PROJECT_ID` | ID del proyecto en EAS |

### 4. Correr en desarrollo

```bash
# Expo Go (recomendado para desarrollo)
npx expo start

# Android
npx expo start --android

# iOS
npx expo start --ios
```

## Estructura del proyecto

```
autonomos/
├── app/           # Rutas (Expo Router)
├── src/
│   ├── domain/         # Entidades, repositorios, casos de uso
│   ├── infrastructure/ # API client, repositorios, socket
│   ├── presentation/   # Componentes, stores, hooks, theme
│   └── shared/         # Utils, validaciones, i18n, constantes
└── assets/
```

## Módulos implementados

- [x] Autenticación (login, registro, OTP, sesión persistente)
- [x] Home con dashboard por rol
- [x] Marketplace con paginación infinita y carrito
- [x] Servicios con proveedores geolocalizados
- [x] Tracking en tiempo real con mapa
- [x] Emergencia SOS con countdown y confirmación
- [x] Perfil de usuario
- [x] Internacionalización ES/EN
- [x] Manejo de errores centralizado
- [x] Socket.io para tiempo real

## Build de producción

```bash
# Configurar EAS
eas build:configure

# Build Android
eas build --platform android

# Build iOS
eas build --platform ios

# OTA Update
eas update --branch production --message "descripción"
```

## Tests

```bash
npm test
npm run test:coverage
```

---

*AUTONOMOS · Colombia → Latinoamérica · 2026*
