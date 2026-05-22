# AUTONOMOS

Plataforma tecnológica automotriz para Colombia y LATAM. Conecta conductores con autopartes, talleres mecánicos, grúas, ambulancias y red de contactos de emergencia. App móvil multiplataforma (iOS / Android / Web) + backend Node/Express.

## Qué hace la app

| Feature | Para qué sirve |
|---|---|
| **Marketplace** | Compra de autopartes con búsqueda, filtros, paginación, comparación de proveedores |
| **Servicios on-demand** | Solicita mecánico, grúa, ambulancia o logística desde la ubicación actual |
| **Tracking en vivo** | Sigue al proveedor en mapa real-time (Socket.io) con ETA actualizado |
| **SOS de emergencia** | Botón de pánico con countdown 3s, envía alerta + notifica contactos vía backend |
| **Chat con proveedor** | Mensajería per-servicio con persistencia HTTP + push real-time |
| **Checkout** | 3 pasos (dirección → pago → confirmación), métodos: tarjeta, PSE, Nequi, efectivo |
| **Perfil completo** | Vehículos, documentos verificables (cédula, SOAT, etc.), métodos de pago, reseñas, contactos SOS, notificaciones |
| **Autenticación** | Login/registro con JWT, refresh token automático, roles `CONDUCTOR` / `TALLER` / `AUTONOMO` / `EMPRESA` |
| **i18n** | Español (default) + Inglés |

## Stack

React Native 0.76 · Expo SDK 52 · TypeScript · Expo Router v3 · Zustand · React Query v5 · Axios · Socket.io · Zod · expo-secure-store · expo-location · react-native-maps

## Cómo arrancar

```bash
# 1. Instalar deps (frontend + backend)
npm install
cd backend && npm install && cd ..

# 2. Configurar env
cp .env.example .env
cp backend/.env.example backend/.env

# 3. Levantar la base de datos y semilla
cd backend
npx prisma db push
npx tsx prisma/seed.ts
npm run dev                # backend en http://localhost:3000/v1

# 4. En otra terminal, arrancar Metro
cd ..
npx expo start             # metro en http://localhost:8081
```

**Login demo**: `test@autonomos.co` / `Test1234`

## Arquitectura

El frontend sigue Clean Architecture en 4 capas (`domain → data → infrastructure → presentation`) con composition root en `src/di/container.ts`. Detalle completo, reglas de dependencias, flujos de datos, convenciones y deuda técnica en [**ARCHITECTURE.md**](./ARCHITECTURE.md).

## Estructura

```
app/                 Expo Router screens
src/
├── domain/          Entities, repository interfaces, use cases (puro)
├── data/            Repository impls + mappers
├── infrastructure/  Axios, Socket.io, storage
├── presentation/    Zustand stores, hooks, components, theme
├── di/              Composition root
└── shared/          i18n, validations, formatters
backend/             Express + Prisma (sistema externo)
```

## Plataformas

Probado en web, Android (emulador y dispositivo) e iOS Simulator. Para Android emulador cambiar `API_URL=http://10.0.2.2:3000/v1` en `.env`; para dispositivo físico usar la IP LAN.

## Estado del proyecto

Rama actual `juanCode_1.0` — refactor completo a Clean Architecture cerrado, login funcional en web + nativo, mappers de Emergency y User cerrados, socket fix aplicado. Detalle de los 20 commits del refactor y la deuda pendiente en [ARCHITECTURE.md §11](./ARCHITECTURE.md#11-historia-del-refactor) y [§9](./ARCHITECTURE.md#9-deuda-técnica-anotada).

**Bugs críticos resueltos**:
- Login en web fallaba por `expo-secure-store` stub vacío + envelope mismatch backend↔cliente (commits `386e5da`, `4e3f7ea`).
- `Emergency.location` y `User.location` siempre `undefined` por desajuste `locationLat`/`Lng` vs `Coordinates` (commits `2a792d3`, `48c7286`).

## Rutas principales

```
/(auth)/login            login (test@autonomos.co / Test1234)
/(auth)/register         registro de nuevo usuario
/(tabs)/                 home, marketplace, services, orders, profile
/product/[id]            detalle de producto
/service/[id]            detalle de proveedor + solicitud de servicio
/tracking/[orderId]      mapa en vivo del pedido o servicio
/chat/[serviceId]        chat con el proveedor
/checkout                checkout del carrito
/emergency               botón SOS + estado de emergencia activa
/profile/{edit,vehicles,documents,payments,reviews,notifications,emergency-contacts,settings}
```
