# Arquitectura del frontend — AUTONOMOS

Documento de referencia para el desarrollo del cliente móvil/web de AUTONOMOS. Cubre la organización en capas, las reglas de dependencias, las convenciones específicas del proyecto y la deuda técnica conocida.

Esta doc cubre **solo el frontend** (`/`, sin contar `backend/`). El backend se trata como sistema externo: se documenta el contrato observado, no su implementación.

---

## 1. Visión general

AUTONOMOS es la app del lado del cliente para una plataforma automotriz (Colombia → LATAM). Permite comprar autopartes en un marketplace, solicitar servicios mecánicos / grúa / ambulancia, emergencias SOS con notificación de contactos, tracking en tiempo real y gestión de perfil (vehículos, documentos, pagos, reseñas).

**Stack**

| Capa | Tecnología |
|---|---|
| Runtime | Expo SDK 52 + React Native 0.76 |
| Lenguaje | TypeScript |
| Routing | Expo Router v3 (file-based, dir `app/`) |
| Estado | Zustand (state cliente) + React Query v5 (cache servidor) |
| HTTP | Axios con interceptores |
| Real-time | Socket.io-client |
| Storage | `expo-secure-store` (con fallback `localStorage` en web) + `AsyncStorage` |
| Forms | `react-hook-form` + Zod (`zodResolver`) |
| i18n | `i18next` + `react-i18next` |
| Estilos | StyleSheet RN + tema centralizado |

---

## 2. Diagrama de capas

```
┌─────────────────────────────────────────────────────────┐
│                       app/                              │   Routing
│         (Expo Router file-based screens)                │   (entry)
└──────────────────┬──────────────────────────────────────┘
                   │ importa
                   ▼
┌─────────────────────────────────────────────────────────┐
│                  src/presentation/                      │
│   stores (Zustand) · hooks · components · theme         │   UI
└────────┬────────────────────────────────────┬───────────┘
         │                                    │
         │ usa container.repos/.useCases      │ tipa con
         │                                    │ entities/use cases
         ▼                                    ▼
┌────────────────────────┐         ┌──────────────────────┐
│      src/di/           │────────▶│     src/domain/      │
│   container.ts         │  cablea │ entities · repos     │   Dominio
│  (composition root)    │         │ usecases             │   (puro)
└────────┬───────────────┘         └────────▲─────────────┘
         │                                  │
         │ instancia                        │ implementa
         ▼                                  │
┌─────────────────────────────────────────────────────────┐
│                      src/data/                          │
│       repositories (impl) · mappers                     │   Datos
└──────────────────┬──────────────────────────────────────┘
                   │ usa
                   ▼
┌─────────────────────────────────────────────────────────┐
│                  src/infrastructure/                    │
│   api/ (axios)  ·  socket/  ·  storage/                 │   I/O externo
└─────────────────────────────────────────────────────────┘

src/shared/  (i18n, validations, formatters, constants)
   ↳ usado libremente desde cualquier capa
```

---

## 3. Regla de dependencias

**Flecha = "puede importar"**. Sentido único.

```
app/  ─→  presentation  ─→  domain
              │
              └──→  di  ─→  data  ─→  domain
                            │
                            └─→  infrastructure
```

### Imports prohibidos

| Desde | NO puede importar | Razón |
|---|---|---|
| `domain/` | nada de `data/`, `infrastructure/`, `presentation/`, `app/`, ni libs externas (excepto puramente de tipos) | Dominio puro |
| `presentation/` | `data/` o `infrastructure/` directo | Acoplaría UI a HTTP/storage |
| `app/` | `data/` o `infrastructure/` directo | Routing solo conoce UI + DI |
| `infrastructure/` | `domain/`, `data/`, `presentation/` | I/O autónomo |

### Cómo verificar a ojo

> Si necesitas importar algo que cruza una flecha prohibida → mete un repo o un use case en medio.

Ejemplo: si una screen necesita disparar `apiClient.post('/foo')`, se está acoplando a infraestructura. La forma correcta es definir un método en el repo correspondiente y consumir `container.repos.X.foo()` desde la screen.

---

## 4. Responsabilidad por carpeta

### `src/domain/`

Reglas de negocio puras, sin frameworks ni I/O.

- **`entities/`** — tipos de los modelos (`User`, `Order`, `Product`, `Provider`, `Service`, `Emergency`). TypeScript puro. Cero deps externas.
- **`repositories/`** — interfaces (`IAuthRepository`, `IOrderRepository`, ...). Contratos que la capa `data` implementa.
- **`usecases/`** — orquestación de reglas. Reciben repos por constructor. Hoy hay 3: `LoginUseCase`, `TriggerSOSUseCase`, `GetProductsUseCase`.

**NO vive aquí**: imports de Axios, Zustand, expo-*, React, ni nada que requiera runtime de framework.

**Ejemplo**: `src/domain/repositories/IAuthRepository.ts` declara `login(email, password): Promise<AuthResponse>` — sin saber si por HTTP, GraphQL o mock.

### `src/data/`

Implementaciones concretas de los contratos del dominio.

- **`repositories/`** — `XxxRepositoryImpl` que implementan `IXxxRepository`. Usan `apiClient` de `infrastructure/api`. Devuelven entidades del dominio.
- **`mappers/`** — funciones puras que traducen el wire format del backend a las entidades del dominio. Aquí viven `toUser` y `toEmergency`.

**NO vive aquí**: estado, hooks de React, componentes.

**Ejemplo**: `AuthRepositoryImpl.login` hace `apiClient.post('/auth/login', ...)`, recibe el payload, lo pasa por `toUser` y devuelve un `AuthResponse` tipado del dominio.

### `src/infrastructure/`

Adaptadores a sistemas externos. Sin lógica de negocio.

- **`api/client.ts`** — instancia Axios con interceptors (auth + unwrap del envelope `{success, data}` + refresh token en 401).
- **`api/endpoints.ts`** — constantes con todas las URLs. Cualquier nueva URL del backend se promueve aquí, no se hardcodea en repo.
- **`socket/socketClient.ts`** — wrapper de Socket.io-client con auth por token.
- **`storage/secureStorage.ts`** — wrapper de `expo-secure-store` con fallback automático a `window.localStorage` en web. **NUNCA importes `expo-secure-store` directo**.
- **`storage/localStorage.ts`** — wrapper de `AsyncStorage` para datos no sensibles.

**NO vive aquí**: tipos de dominio (los importa pero no los declara).

### `src/presentation/`

Capa de UI y estado cliente.

- **`stores/`** — Zustand stores. Consumen `container.repos.*` y `container.useCases.*`. Aquí: `authStore`, `cartStore`, `emergencyStore`, `locationStore`.
- **`hooks/`** — hooks reusables (`useDebounce`, `useOfflineDetect`).
- **`components/ui/`** y **`components/layout/`** — componentes presentacionales. Solo importan theme. No conocen API ni stores.
- **`theme/`** — `colors`, `spacing`, `typography`. Tema global.

**NO vive aquí**: imports a `data/` o `infrastructure/`. Si una store necesita un repo, lo toma de `container`, no del impl.

### `src/di/`

- **`container.ts`** — composition root. Instancia los 8 repos y los 3 use cases una sola vez. Expone `container.repos.*` y `container.useCases.*`. Sin lib de DI.

### `src/shared/`

Utilidades transversales sin pertenencia a capa.

- **`i18n/`** — config de i18next con cargas estáticas (`es.json`, `en.json`).
- **`validations/`** — schemas Zod (`loginSchema`, `registerSchema`, etc.). Consumidos por screens vía `zodResolver`.
- **`utils/formatters.ts`** — `formatCOP`, `formatDate`, `formatETA`, `formatDistance`.
- **`constants/`** — constantes de dominio bajas (ej. tipos de servicio).

### `app/`

Capa de routing (Expo Router file-based). Cada archivo `app/X.tsx` es una ruta. Layouts (`_layout.tsx`) configuran navegación.

Solo importa `src/presentation/` (componentes, stores, theme) y `src/di/container` (para data via repos/use cases). **NUNCA importa `apiClient` ni `SecureStore` directo**.

Estructura:
```
app/
├── _layout.tsx              raíz, QueryClientProvider, fonts, Stack
├── (auth)/                  grupo sin tab bar
│   ├── login.tsx
│   ├── register.tsx
│   └── onboarding.tsx
├── (tabs)/                  grupo con tab bar
│   ├── index.tsx            home
│   ├── marketplace.tsx
│   ├── services.tsx
│   ├── orders.tsx
│   └── profile.tsx
├── product/[id].tsx
├── service/[id].tsx
├── tracking/[orderId].tsx
├── checkout/index.tsx
├── chat/[serviceId].tsx
├── emergency/index.tsx
└── profile/{edit,vehicles,documents,payments,reviews,notifications,emergency-contacts,settings}.tsx
```

### 4.1 Catálogo del dominio (lo que existe HOY)

**Entities** (6 — `src/domain/entities/`)

| Entity | Archivo | Resumen |
|---|---|---|
| `User` | `User.ts` | Usuario + `Coordinates` (definido aquí por razones históricas — ver deuda §9) |
| `Order` | `Order.ts` | Pedido del marketplace + `OrderStatus` (PENDING/CONFIRMED/PREPARING/IN_TRANSIT/DELIVERED/CANCELLED) |
| `Product` | `Product.ts` | Producto + `CartItem` |
| `Provider` | `Provider.ts` | Proveedor de servicio + `ServiceType` |
| `Service` | `Service.ts` | `ServiceRequest` + `ChatMessage` + `TowingRequest` |
| `Emergency` | `Emergency.ts` | Emergencia SOS + `EmergencyContact` + `EmergencyStatus` ('ACTIVE'/'CANCELLED') |

**Repositorios** (8 contratos + 8 impls)

| Interface (`domain/repositories/`) | Impl (`data/repositories/`) | Surface principal |
|---|---|---|
| `IAuthRepository` | `AuthRepositoryImpl` | login, register, logout, refreshToken, sendOtp/verifyOtp, forgotPassword/resetPassword, getCurrentUser, updateProfile, uploadAvatar |
| `IOrderRepository` | `OrderRepositoryImpl` | createOrder, getOrders, getOrderById, cancelOrder, trackOrder |
| `IProductRepository` | `ProductRepositoryImpl` | getProducts (filtros + paginación), getProductById, getProductsByProvider, compareProviders, searchProducts |
| `IServiceRepository` | `ServiceRepositoryImpl` | getNearbyProviders, getProvider, createServiceRequest, getServiceRequest, getUserServices, accept/rejectQuote, complete/cancelService, send/getMessages |
| `ILocationRepository` | `LocationRepositoryImpl` | requestPermissions, getCurrentLocation, startTracking, stopTracking, reverseGeocode, calculateDistance (Haversine) |
| `IEmergencyRepository` | `EmergencyRepositoryImpl` | create, cancel, updateLocation, notifyContacts, getHistory, getContacts, addContact, removeContact |
| `IUserRepository` | `UserRepositoryImpl` | getVehicles/addVehicle/removeVehicle, getDocuments/uploadDocument/deleteDocument, getMyReviews, getPaymentMethods/addPaymentMethod/removePaymentMethod |
| `INotificationsRepository` | `NotificationsRepositoryImpl` | list, markRead, markAllRead |

**Use cases** (3 — `domain/usecases/`)

| Use case | Repo que recibe | Lógica que añade |
|---|---|---|
| `LoginUseCase` | `IAuthRepository` | Valida email/password (red de seguridad sobre Zod) + `.toLowerCase().trim()` del email |
| `TriggerSOSUseCase` | `IEmergencyRepository` | `if (!location) throw` (guard defensivo) + delega al repo |
| `GetProductsUseCase` | `IProductRepository` | Pass-through con defaults (page=1, limit=10) |

**Mappers** (2 — `data/mappers/`)

| Mapper | Función | Cubre |
|---|---|---|
| `userMapper.toUser` | wire → `User` | `locationLat`/`Lng` → `Coordinates`; fallback `role` desconocido → `'CONDUCTOR'`; `null` → `undefined` |
| `emergencyMapper.toEmergency` | wire → `Emergency` | `locationLat`/`Lng` → `Coordinates` (o usa `location` si backend lo pre-pack); fallback `type` desconocido → `'OTRO'`; fallback `status` desconocido → `'ACTIVE'` (fail-safe pánico) |

**Stores Zustand** (4 — `presentation/stores/`)

| Store | Estado | Acciones HTTP |
|---|---|---|
| `useAuthStore` | `user`, `isAuthenticated`, `isLoading`, `error` | login (vía `LoginUseCase`), register, logout, loadUser, updateUser |
| `useCartStore` | `items[]`, `total`, `itemCount` | (pura UI — sin HTTP) |
| `useLocationStore` | `currentLocation`, `currentAddress`, `isTracking`, `hasPermission` | requestPermissions, getCurrentLocation, startTracking, stopTracking |
| `useEmergencyStore` | `activeEmergency`, `history[]`, `contacts[]`, `countdown`, `isCountingDown` | triggerSOS (vía `TriggerSOSUseCase`), cancelEmergency, updateLocation, loadHistory, loadContacts |

---

## 5. Composition root (DI sin librería)

`src/di/container.ts` es el único lugar donde se llama `new XxxImpl()`. Stores y screens consumen instancias ya cableadas.

```ts
// di/container.ts (simplificado)
import { AuthRepositoryImpl } from '../data/repositories/AuthRepositoryImpl';
import { LoginUseCase } from '../domain/usecases/auth/LoginUseCase';
// ...

const auth: IAuthRepository = new AuthRepositoryImpl();
const emergency: IEmergencyRepository = new EmergencyRepositoryImpl();
// ...

export const container = {
  repos: { auth, order, product, service, location, emergency, user, notifications },
  useCases: {
    login: new LoginUseCase(auth),
    triggerSOS: new TriggerSOSUseCase(emergency),
    getProducts: new GetProductsUseCase(product),
  },
};
```

### Por qué no se usa una lib de DI

- **Volumen**: 8 repos + 3 use cases. Una lib (InversifyJS, tsyringe) introduce decorators + reflect-metadata + build flags + complejidad de tests, sin beneficio a esta escala.
- **Simplicidad**: módulo plano, instancias singleton por carga del módulo. Funciona con Metro/Hermes sin tooling extra.

### Añadir un repo nuevo al container

1. Crea `IXxxRepository` en `domain/repositories/`.
2. Crea `XxxRepositoryImpl` en `data/repositories/`.
3. Importa ambos en `di/container.ts`.
4. Instancia: `const xxx: IXxxRepository = new XxxRepositoryImpl();`
5. Expón: añade `xxx` en `container.repos`.

### Testear con un mock

```ts
// en el test
import { container } from '@/di/container';

class FakeAuthRepo implements IAuthRepository { /* ... */ }

(container.repos as any).auth = new FakeAuthRepo();
```

Si el container crece o esto se vuelve incómodo, se cambia `export const container` por un factory function. Hoy no hace falta.

---

## 6. Flujo de datos de una acción

### Ejemplo canónico: usuario tap "Iniciar sesión"

Este flujo concentra las dos piezas críticas del proyecto: **el interceptor que desempaca el envelope del backend** y **el mapper que traduce wire format a entity**.

```
┌─────────────────────────────────────────────────────────────────────┐
│ 1. app/(auth)/login.tsx                                             │
│    onSubmit(data) → useAuthStore().login(data.email, data.password) │
└─────────────────────────┬───────────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 2. presentation/stores/authStore.ts                                 │
│    set({ isLoading: true })                                         │
│    await container.useCases.login.execute(email, password)          │
└─────────────────────────┬───────────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 3. domain/usecases/auth/LoginUseCase.ts                             │
│    - valida (email no vacío, regex, password ≥6)                    │
│    - normaliza: email.toLowerCase().trim()                          │
│    - delega: this.authRepo.login(email, password)                   │
└─────────────────────────┬───────────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 4. data/repositories/AuthRepositoryImpl.ts                          │
│    const { data } = await apiClient.post(AUTH.LOGIN, {...})         │
│    const user = toUser(data.user)                                   │
│    await secureStorage.set(ACCESS_TOKEN, data.tokens.accessToken)   │
│    return { user, tokens: data.tokens }                             │
└─────────────────────────┬───────────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 5. infrastructure/api/client.ts                                     │
│    request interceptor → adjunta `Authorization: Bearer <token>`    │
│       (lo lee de secureStorage; fallback web a localStorage)        │
└─────────────────────────┬───────────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 6. backend                                                          │
│    responde: { success: true, data: { user: {...}, tokens: {...}}}  │
└─────────────────────────┬───────────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 7. infrastructure/api/client.ts (response interceptor)              │
│    desempaca: response.data = response.data.data                    │
│    → ahora response.data = { user: {...}, tokens: {...} }           │
└─────────────────────────┬───────────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 8. data/mappers/userMapper.ts                                       │
│    toUser(raw) construye:                                           │
│      - role: valida contra set, fallback 'CONDUCTOR'                │
│      - location: Coordinates desde locationLat/locationLng          │
│      - avatar: null → undefined                                     │
│    Devuelve User del dominio, no el shape del wire                  │
└─────────────────────────┬───────────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 9. presentation/stores/authStore.ts                                 │
│    set({ user, isAuthenticated: true, isLoading: false })           │
└─────────────────────────┬───────────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 10. app/(auth)/login.tsx                                            │
│     router.replace('/(tabs)')                                       │
└─────────────────────────────────────────────────────────────────────┘
```

**Lo importante de este flujo**:
- El interceptor **siempre** desempaca; los repos NUNCA escriben `data.data.user`, escriben `data.user`.
- El mapper **siempre** traduce; los stores nunca ven `locationLat` ni `locationLng`.
- Zod (en `login.tsx`) y `LoginUseCase` validan en capas distintas. No es duplicación: Zod hace feedback inline en el formulario, el use case backstop si alguien invoca el store fuera del form.

### Otros ejemplos breves

**SOS**: `emergency/index.tsx → emergencyStore.triggerSOS → container.useCases.triggerSOS → emergencyRepo.create → apiClient.post → interceptor unwrap → toEmergency → store guarda activeEmergency`.

**Marketplace fetch**: `marketplace.tsx → useInfiniteQuery → container.useCases.getProducts.execute → productRepo.getProducts → apiClient.get → interceptor unwrap → screen recibe PaginatedResult<Product>`.

---

## 7. Cómo añadir una feature nueva

Receta paso a paso. Adapta según el caso (no siempre necesitas todo).

### a) ¿Necesitas una entity nueva?

Si el dato no existe como tipo, créalo en `src/domain/entities/Xxx.ts`:

```ts
// domain/entities/Promo.ts
export interface Promo {
  id: string;
  code: string;
  discount: number;
  expiresAt: string;
}
```

Si reusas (`User`, `Coordinates`, etc.), saltas este paso.

### b) Define el contrato del repo

```ts
// domain/repositories/IPromoRepository.ts
import { Promo } from '../entities/Promo';

export interface IPromoRepository {
  list(): Promise<Promo[]>;
  redeem(code: string): Promise<Promo>;
}
```

### c) Implementa el repo en `data/`

```ts
// data/repositories/PromoRepositoryImpl.ts
import apiClient from '../../infrastructure/api/client';
import { ENDPOINTS } from '../../infrastructure/api/endpoints';
import { IPromoRepository } from '../../domain/repositories/IPromoRepository';
import { Promo } from '../../domain/entities/Promo';

export class PromoRepositoryImpl implements IPromoRepository {
  async list(): Promise<Promo[]> {
    const { data } = await apiClient.get<Promo[]>(ENDPOINTS.PROMOS.LIST);
    return data;
  }

  async redeem(code: string): Promise<Promo> {
    const { data } = await apiClient.post<Promo>(ENDPOINTS.PROMOS.REDEEM, { code });
    return data;
  }
}
```

### d) ¿El backend te emite algo distinto a la entity?

Crea un mapper en `data/mappers/`. Aplícalo dentro del repo, no fuera. Patrón actual: `toUser`, `toEmergency`. Si el backend declara campos como string libre y la entity como enum, mete validación contra el set + fallback seguro + `console.warn` en `__DEV__`.

### e) Añade los endpoints

```ts
// infrastructure/api/endpoints.ts
PROMOS: {
  LIST: '/promos',
  REDEEM: '/promos/redeem',
},
```

### f) Cablea en el container

```ts
// di/container.ts
import { PromoRepositoryImpl } from '../data/repositories/PromoRepositoryImpl';
const promo: IPromoRepository = new PromoRepositoryImpl();

export const container = {
  repos: { /* ...existentes */, promo },
  // ...
};
```

### g) ¿Necesitas un use case?

Crea uno **solo si** hay validación de dominio o orquestación entre repos. Si el repo basta, no añadas un pass-through (es ruido).

```ts
// domain/usecases/promo/RedeemPromoUseCase.ts (solo si valida)
export class RedeemPromoUseCase {
  constructor(private readonly repo: IPromoRepository) {}

  async execute(code: string): Promise<Promo> {
    if (!code.match(/^[A-Z0-9]{6,12}$/)) throw new Error('Código inválido');
    return this.repo.redeem(code.toUpperCase());
  }
}
```

Cablea en `container.useCases`.

### h) Consume desde la capa que corresponda

**Criterio de dónde ponerlo**:

| Necesidad | Dónde |
|---|---|
| Validación previa al llamado, normalización de inputs | Use case |
| Estado compartido entre screens, persistencia, cache de cliente con lógica | Zustand store |
| Fetch one-shot que solo afecta a UNA screen, sin lógica | Directo en la screen vía React Query |

**Ejemplo store**:
```ts
const promo = container.repos.promo;
// ... dentro del store
const list = await promo.list();
```

**Ejemplo screen**:
```ts
const { data } = useQuery({
  queryKey: ['promos'],
  queryFn: () => container.repos.promo.list(),
});
```

---

## 8. Convenciones específicas del proyecto

### Contrato con el backend (sistema externo)

El frontend asume estos invariantes del backend. Si cambian, el frontend rompe predeciblemente.

**Envelope de respuesta**: TODA respuesta exitosa viene envuelta en
```json
{ "success": true, "message": "opcional", "data": <payload> }
```

El response interceptor en `client.ts` desempaca automáticamente: los repos reciben directamente `<payload>` en `response.data`. **Nunca escribir `data.data` en código de repos** — el interceptor ya hizo ese trabajo.

**Errores HTTP**: el backend devuelve `{success: false, message: '...'}` con códigos 4xx/5xx. `mapApiError` en `client.ts` los traduce a `Error` con mensaje en español por status.

**Garantías que el backend NO da**:

- **Enums como string libre**: Prisma + SQLite no soportan enums nativos. Campos como `Emergency.status`, `Emergency.type`, `User.role` se almacenan como `String` libre. **El frontend NO puede asumir que el valor está en el conjunto declarado por la entity**. Por eso los mappers (`toUser`, `toEmergency`) validan contra un set fijo con fallback defensivo:

  | Campo | Fallback ante valor desconocido | Razón |
  |---|---|---|
  | `EmergencyType` | `'OTRO'` | Catch-all semántico |
  | `EmergencyStatus` | `'ACTIVE'` | Fail-safe pánico: nunca dar por cancelada una alerta posiblemente viva |
  | `UserRole` | `'CONDUCTOR'` | Rol de menor privilegio |

  Cada fallback dispara `console.warn` en `__DEV__` para investigación.

- **Coordenadas planas vs Coordinates**: el backend emite `locationLat` y `locationLng` como `Float` separados (User, Emergency, Provider, ServiceRequest). El dominio usa `Coordinates { latitude, longitude }`. Los mappers traducen. En POST `/emergency`, el backend también incluye un campo `location: {latitude, longitude}` listo — el mapper lo prefiere si está presente, si no construye desde lat/lng.

- **Refresh tokens**: backend rota el refresh en cada uso pero el cliente actual solo guarda el nuevo `accessToken`. Si necesitas refresh persistente sin re-login forzado, hay que guardar también el nuevo `refreshToken` que devuelve `/auth/refresh`.

### Wrapper de `expo-secure-store`

**NUNCA importes `expo-secure-store` directamente.** En web, el módulo tiene un stub vacío (`export default {}`) y `SecureStore.setItemAsync('access_token', token)` lanza `TypeError`. Usa siempre el wrapper:

```ts
import { secureStorage, SECURE_KEYS } from '@/infrastructure/storage/secureStorage';

await secureStorage.set(SECURE_KEYS.ACCESS_TOKEN, token);
const token = await secureStorage.get(SECURE_KEYS.ACCESS_TOKEN);
```

El wrapper detecta `Platform.OS === 'web'` y cae a `window.localStorage`.

### Validación: Zod + use case (defensa en dos capas)

- **Zod** (en `src/shared/validations/*.ts`) → feedback inline en formularios vía `react-hook-form` + `zodResolver`. Bloquea submit si falla.
- **Use case** (en `domain/usecases/`) → red de seguridad del dominio. Se ejecuta cuando el form se evita (llamadas futuras desde código, tests, hipotéticos admin CLI).

**No es duplicación**: dos capas con responsabilidades distintas. Si modificas reglas, mantén los mensajes alineados entre Zod (fuente de verdad UX) y el use case (alineado para evitar drift).

### DTOs en repository interfaces

Los DTOs reflejan el **wire format real** que el screen envía al backend, no la entity. Ejemplo:

```ts
// IOrderRepository.ts
export interface CreateOrderDTO {
  items: Array<{ productId: string; quantity: number; price: number }>;
  paymentMethod: PaymentMethod;
  deliveryAddress: string;
  deliveryLocation: Coordinates;
}
```

`items` aquí no es `CartItem[]` (la entity del carrito) — es lo que el screen mapea con `.map(i => ({...}))`. La entity es el resultado del backend, no el body de entrada.

### Endpoints centralizados

Toda URL HTTP vive en `infrastructure/api/endpoints.ts`. Cero hardcoding en repos. Si añades una ruta nueva, promoverla a `ENDPOINTS.XXX.YYY` aunque la uses una sola vez.

### 8.1 Variables de entorno

Leídas por `app.config.ts` y expuestas vía `Constants.expoConfig.extra`.

| Variable | Default | Para qué sirve | Dónde se consume |
|---|---|---|---|
| `API_URL` | `http://localhost:6000/v1` (fallback en `client.ts`) | URL base del backend REST. Cliente Axios la lee al iniciar | `src/infrastructure/api/client.ts:5` |
| `SOCKET_URL` | `wss://socket.autonomos.co` (fallback en `socketClient.ts`) | URL del servidor Socket.io para tracking, chat, push de emergencias | `src/infrastructure/socket/socketClient.ts:5` |
| `GOOGLE_MAPS_KEY` | — | API key para `react-native-maps` (provider Google) en tracking | `app.config.ts` → consumido por nativo Android/iOS |
| `EAS_PROJECT_ID` | — | ID del proyecto EAS para builds y updates OTA | `app.config.ts:71` |

**Para desarrollo local con backend en localhost:3000**, el `.env` del frontend debe tener:
```
API_URL=http://localhost:3000/v1
SOCKET_URL=ws://localhost:3000
```

**Backend** (env vars en `backend/.env`, leídas por `backend/src/config/env.ts`):

| Variable | Default | Notas |
|---|---|---|
| `NODE_ENV` | `development` | development / production / test |
| `PORT` | `3000` | Puerto HTTP del backend |
| `DATABASE_URL` | `file:./dev.db` | Conexión Prisma (SQLite por default) |
| `JWT_ACCESS_SECRET` | — | Min 32 chars. Firma access tokens (15min TTL) |
| `JWT_REFRESH_SECRET` | — | Min 32 chars. Firma refresh tokens (7d TTL) |
| `JWT_ACCESS_EXPIRES` | `15m` | TTL del access token |
| `JWT_REFRESH_EXPIRES` | `7d` | TTL del refresh token |
| `BCRYPT_ROUNDS` | `12` | Costo de hashing de passwords |
| `CORS_ORIGINS` | `http://localhost:8090,http://localhost:3001` | Whitelist CORS (devel permite cualquier localhost) |
| `RATE_LIMIT_WINDOW_MS` | `900000` (15min) | Ventana del rate limiter global |
| `RATE_LIMIT_MAX` | `100` | Requests por ventana, por IP |
| `AUTH_RATE_LIMIT_MAX` | `5` | Requests al endpoint de auth por ventana (anti brute-force) |

---

## 9. Deuda técnica anotada

Lista ordenada por **impacto en la base de código actual**, no por antigüedad. Cada entrada indica prioridad de pago.

### 🔴 Alta prioridad

**1. Entities faltantes + `Promise<any>` en repos `user` y `notifications`**

Los screens declaran interfaces locales (`interface Vehicle { ... }`, `interface Document { ... }`, etc.) que el dominio no conoce. Los repos correspondientes devuelven `Promise<any>` y los screens tipan vía `useQuery<LocalType>`. Esto:

- Apaga la verificación de tipos entre wire format y consumidor.
- Permite que el backend cambie un campo y el frontend lo descubra en runtime.
- Duplica definiciones cuando dos screens piden el mismo recurso.

**Acción**: crear `domain/entities/{Vehicle,Document,PaymentMethod,Review,Notification}.ts` con los campos que efectivamente usan los screens, retipar los repos para devolver esas entities, y eliminar las interfaces locales de los screens.

### 🟡 Media prioridad

**2. Acoplamiento conceptual: 5 entidades importan `Coordinates` desde `User`**

`Emergency`, `Order`, `Product`, `Provider`, `Service` importan `Coordinates` de `domain/entities/User.ts`. Son coordenadas geográficas — no tienen relación conceptual con el usuario. Esto crea un acoplamiento cruzado innecesario: cualquier cambio en `User` puede arrastrar 5 entidades sin causa.

**Acción**: extraer `Coordinates` a `domain/value-objects/Coordinates.ts`, actualizar los ~17 imports. El cambio es mecánico (find/replace de paths) pero ruidoso. Hacerlo en su propio commit, no mezclado con otras cosas.

**3. `uploadAvatar` vive en `IAuthRepository` pero pertenece a `IUserRepository`**

Cuando se hizo el commit del avatar, `IUserRepository` no existía. Ahora sí. `uploadAvatar` es una operación de perfil de usuario, no de autenticación.

**Acción**: mover el método y el call site en `profile/edit.tsx`. Test rápido del flujo de cambio de avatar después.

**4. `ServiceRequest` y `Provider` pueden sufrir el mismo bug que `User` y `Emergency`**

Ambos tienen `locationLat/locationLng` en la base de datos. Hoy no causan bug observable porque la UI no lee `serviceRequest.location` ni `provider.location` como `Coordinates`. Si una pantalla futura lo hace, va a estar undefined sin mapper.

**Acción**: cuando UI empiece a leer esos campos, crear mappers `toServiceRequest` y `toProvider`. Preventivo si quieres adelantarte.

### 🟢 Baja prioridad

**5. Ciclo de vida real del SOS no implementado**

Backend solo emite `status: 'ACTIVE' | 'CANCELLED'`. El flujo realista de emergencia (despacho → en ruta → llegada → resolución) no está modelado. Hoy la UI no depende de estados intermedios — muestra "Ambulancia despachada" hardcoded post-create.

**Acción**: feature de producto, no de mapper. Requiere diseño de transiciones, backend, y UI con timeline. Branch separada cuando se priorice.

**6. Tipos locales duplicados en screens**

Pequeñas interfaces declaradas in-screen (ej. `EmergencyContact` en `emergency-contacts.tsx`) que repiten lo que ya vive en `domain/entities/`. Acumula con cada feature. Se resuelve naturalmente al pagar la deuda #1.

**7. Errores TS preexistentes de color palette**

`colors.neutral[400]`, `[600]`, `[800]` no existen en el tipo de `colors.neutral` (solo declara 50/100/200/300/500/700/900). Múltiples screens los usan. En runtime funciona porque `colors.neutral[400]` retorna `undefined` y RN lo trata como missing color. Es feo y TS lo grita.

**Acción**: completar la paleta en `src/presentation/theme/colors.ts` con los tonos faltantes.

---

## 10. Anexo: comandos útiles

### Mobile
```bash
npx expo start            # dev server (Expo Go)
npx expo start --clear    # cache cleared (úsalo si Metro se cuelga con imports stale)
npx expo start --android
npx expo start --ios
npm run lint
npm test
```

### Backend (durante desarrollo local)
```bash
cd backend
npm run dev               # tsx watch
npx prisma db push        # sync schema → SQLite
npx tsx prisma/seed.ts    # seed (crea el usuario demo)
npx prisma studio         # GUI DB
```

### Credenciales de seed
```
email:    test@autonomos.co
password: Test1234
```

### URLs locales por defecto
```
backend:   http://localhost:3000/v1
metro:     http://localhost:8081
```

Para que la app conecte al backend local, el `.env` del frontend debe apuntar a `API_URL=http://localhost:3000/v1`. Para Android emulador usa `http://10.0.2.2:3000/v1`; para dispositivo físico usa la IP LAN de la máquina.

---

## 11. Historia del refactor

La rama `juanCode_1.0` salió del commit inicial `0119e75` y aplicó **20 commits** que transformaron una arquitectura nominal-Clean (con varias violaciones) en una arquitectura Clean real con dos bug fixes críticos de por medio.

### Estado inicial (diagnóstico PASO 1)

El proyecto declaraba 3 capas (`domain`, `infrastructure`, `presentation`) pero violaba la regla de dependencias en múltiples puntos:

| Hallazgo | Descripción |
|---|---|
| #1 | Dominio dependía de infraestructura: `TriggerSOSUseCase` importaba `apiClient` y `ENDPOINTS` |
| #2 | 8 screens hacían `apiClient.get/post` directo, bypaseando 5 repos que NADIE consumía |
| #3 | `emergencyStore` llamaba `apiClient` directo en 5 métodos sin pasar por repo |
| #4 | Stores instanciaban `new XxxImpl()` hardcoded (acoplamiento Presentation→Infrastructure) |
| #5 | 3 use cases definidos pero ningún consumidor |
| #6 | Sin DTOs ni mappers — entity `User` declaraba `location: Coordinates` pero backend emitía `locationLat`/`locationLng` planos → siempre `undefined` |
| #7 | `socketClient` importaba `SecureStore` directo — mismo bug que el de login en web |
| #8 | `Coordinates` acoplado a `User` sin razón conceptual |
| #9 | Sin DI container, imposible swap por mock |
| #10 | `EmergencyStatus` declarado con 5 valores (`PENDING`/`DISPATCHED`/`IN_ROUTE`/`ARRIVED`/`RESOLVED`) que el backend jamás emite |

Además, dos bugs bloqueantes ya manifiestos:
- Login en web fallaba con `TypeError: ExpoSecureStore.setValueWithKeyAsync is not a function` (stub web vacío en SDK 52).
- Login en cualquier plataforma fallaba porque el cliente esperaba `data.tokens` directo, pero backend envolvía en `{success, message, data: {user, tokens}}`.

### Cronología de commits

```
0119e75  feat: initial commit — AUTONOMOS mobile app + backend (base)

[FIXES BLOQUEANTES — antes del refactor estructural]
386e5da  fix(auth): unwrap API response envelope and support web SecureStore
         · Response interceptor en client.ts desempaca {success, data} automáticamente
         · secureStorage wrapper con fallback Platform.OS === 'web' → localStorage
         · Resuelve login en web + envelope mismatch en todos los repos

[REFACTOR ESTRUCTURAL]
e8dc4d6  refactor(arch): move repository impls from infrastructure to data layer
         · 5 archivos infrastructure/repositories/* → data/repositories/* (git rename detected)

828c731  refactor(arch): add DI container, wire stores via repository interfaces
         · src/di/container.ts nuevo (composition root sin lib)
         · authStore + locationStore consumen container.repos.* en lugar de new XxxImpl()

3e81cc2  refactor(arch): introduce IEmergencyRepository + impl
         · Contrato + impl (copia literal de los HTTP que vivían en emergencyStore + TriggerSOSUseCase)

8538f55  refactor(emergency): emergencyStore consumes IEmergencyRepository via DI
         · 5 métodos del store migrados a container.repos.emergency

723793d  refactor(emergency): TriggerSOSUseCase depends on IEmergencyRepository
         · Cierra hallazgo #1 — dominio ya no importa apiClient
         · ⛔ PAUSA aquí: verificación manual SOS aprobada antes de seguir

9381254  refactor(arch): screens consume repos via DI (lot 1)
         · marketplace, product/[id], orders, checkout/index

73a0635  refactor(arch): screens consume repos via DI (lot 2)
         · services, service/[id], tracking/[orderId], profile/edit

838fced  chore(types): replace `as any` cast with non-null assertion
         · service/[id].tsx createServiceRequest — provider!.serviceType en lugar de cast amplio

d5b34fe  refactor(arch): emergency/index screen consumes repo for notify-contacts
         · Gap detectado: ENDPOINTS.EMERGENCY.NOTIFY_CONTACTS + repo.notifyContacts(id)

d19c210  refactor(arch): wire GetProductsUseCase + TriggerSOSUseCase via DI (iso-behavior)
         · marketplace usa container.useCases.getProducts.execute
         · emergencyStore usa container.useCases.triggerSOS.execute (guard defensa en profundidad)

84e7f39  refactor(auth): wire LoginUseCase via DI as domain-layer safety net
         · Mensajes alineados con Zod (fuente UX de verdad)
         · Cierra hallazgo #5 — los 3 use cases consumidos end-to-end

20444fc  refactor(endpoints): add USERS.DOCUMENTS, USERS.REVIEWS and NOTIFICATIONS section
         · Promueve URLs hardcodeadas a ENDPOINTS

08aa801  refactor(arch): add IUserRepository (split from auth) and migrate 4 profile screens
         · Nuevo repo: 10 métodos para vehicles, documents, reviews, payments
         · Separa CRUD de perfil del repo de auth

e56b44b  refactor(arch): add INotificationsRepository and migrate notifications screen
         · Repo dedicado por dominio (no acumular en auth)

1bbeba7  refactor(arch): emergency-contacts screen consumes IEmergencyRepository CRUD
         · +addContact / +removeContact — flujo SOS completo y coherente

be29584  refactor(arch): chat screen consumes service repo for messages (socket untouched)
         · Última screen migrada — cero apiClient en app/ a partir de aquí

[BUG FIXES POST-REFACTOR]
2a792d3  fix(emergency): map backend payload to clean domain entity (#6)
         · Entity limpia: status reducido a 'ACTIVE'|'CANCELLED', +ambulancePhone, +updatedAt
         · Borrados description/ambulanceId/resolvedAt (letra muerta)
         · Borrados 5 estados aspiracionales del enum (PENDING/DISPATCHED/IN_ROUTE/ARRIVED/RESOLVED)
         · Mapper con fallbacks defensivos: type → 'OTRO', status → 'ACTIVE' (fail-safe pánico)

48c7286  fix(auth): map backend user payload to User entity via userMapper (#6 sibling)
         · Mismo patrón aplicado a User
         · Fallback role → 'CONDUCTOR' (menor privilegio)

4e3f7ea  fix(socket): use secureStorage wrapper instead of SecureStore direct (#7)
         · Bug idéntico al del login original, resuelto en otro archivo
         · Después de esto: SecureStore solo vive dentro del wrapper
```

### Hallazgos del diagnóstico — estado final

| # | Hallazgo | Estado | Commit que lo cierra |
|---|---|---|---|
| #1 | Dominio → infraestructura | ✅ Cerrado | `723793d` |
| #2 | Screens bypaseando repos | ✅ Cerrado (16 screens migradas en 5 lotes) | `9381254` → `be29584` |
| #3 | `emergencyStore` con HTTP directo | ✅ Cerrado | `8538f55` |
| #4 | Stores instanciando Impl | ✅ Cerrado | `828c731` |
| #5 | Use cases sin consumidores | ✅ Cerrado (los 3 cableados) | `d19c210`, `84e7f39` |
| #6 | Sin mappers — `location` undefined | ✅ Cerrado | `2a792d3`, `48c7286` |
| #7 | `socketClient` con `SecureStore` directo | ✅ Cerrado | `4e3f7ea` |
| #8 | `Coordinates` acoplado a `User` | 🟡 Deuda anotada — movimiento mecánico pero 17 archivos | §9 alta-media |
| #9 | Sin DI container | ✅ Cerrado | `828c731` |
| #10 | `EmergencyStatus` con 5 valores aspiracionales | ✅ Cerrado | `2a792d3` |

### Bug del login web (`386e5da`) — antes/después

**Antes**:
- En web, `SecureStore.setItemAsync('access_token', token)` → `TypeError` por stub vacío en SDK 52
- En cualquier plataforma, repos hacían `data.tokens.accessToken` pero `data` era `{success, message, data: {tokens, user}}` → `tokens` undefined → crash

**Después**:
- `secureStorage` detecta web y usa `localStorage`
- Response interceptor desempaca: `response.data = body.data` cuando `body.success === true`
- Repos escriben `data.tokens.accessToken` sin saber del envelope (interceptor ya hizo el unwrap)

### Bug del Emergency mapper (`2a792d3`, `48c7286`) — antes/después

**Antes**:
- Backend emitía `Emergency.locationLat: number` y `Emergency.locationLng: number`
- Entity declaraba `location: Coordinates` → siempre `undefined`
- Entity declaraba `EmergencyStatus` con 5 estados que nadie asignaba ni leía
- `User.location` mismo bug: backend emitía `locationLat`/`Lng`, entity declaraba `Coordinates`

**Después**:
- `toEmergency(raw)` construye `Coordinates` desde `locationLat`/`Lng` (o usa `location` si backend lo pre-pack)
- Entity reducida a campos que el backend realmente emite + UI realmente lee (incluyendo `ambulancePhone` que la UI ya usaba)
- Status enum alineado con realidad: `'ACTIVE' | 'CANCELLED'`
- Fallbacks defensivos vs string libre de Prisma: warn en DEV + valor seguro
- `toUser` aplica el mismo patrón en `AuthRepositoryImpl.login/register/getCurrentUser/updateProfile`

### Métricas del refactor

- **20 commits** sobre `0119e75`
- **Archivos tocados** (aprox): 30 archivos en `src/`, 16 en `app/`, 0 en `backend/`
- **Cero cambios al backend**
- **TS clean** (solo errores pre-existentes de color palette y Prisma StringFilter)
- **Comportamiento idéntico**: login, SOS, marketplace, tracking, chat, notificaciones, perfil — verificados via curl + smoke tests post cada commit crítico

---

## 12. Troubleshooting

Gotchas reales encontrados durante el refactor y el desarrollo. Si te chocas con uno, prueba esto antes de seguir:

### Metro caché stale tras renombrar imports

**Síntoma**: cambiaste un import path y Metro grita `Unable to resolve "..."` aunque el archivo nuevo existe.

**Solución**:
```bash
npx expo start --clear
```

Esto limpia la caché de bundles. Especialmente útil tras refactors estructurales (mover archivos, renombrar carpetas).

### Puerto 8081 ocupado

**Síntoma**: `Port 8081 is being used by another process` al hacer `npx expo start`.

**Solución** (Windows):
```powershell
netstat -ano | findstr ":8081"
# anota el PID, luego:
Stop-Process -Id <PID> -Force
```

O acepta usar `8082` cuando Expo lo proponga (en modo interactivo).

### Login falla en web con error `TypeError: ExpoSecureStore...`

**Síntoma resuelto**, pero si reaparece: alguien volvió a importar `expo-secure-store` directo en lugar de usar el wrapper.

**Solución**:
```ts
// MAL
import * as SecureStore from 'expo-secure-store';

// BIEN
import { secureStorage, SECURE_KEYS } from '@/infrastructure/storage/secureStorage';
```

### Mixed content (HTTPS app → HTTP backend)

**Síntoma**: en web producción, fetch al backend bloqueado.

**Solución**: backend en HTTPS detrás de proxy (nginx, Cloudflare) o exponer el frontend en HTTP también para desarrollo. Para LAN dev, todos en HTTP.

### Android emulador no llega a `localhost:3000`

**Síntoma**: app en emulador Android falla todas las llamadas; en web funciona.

**Causa**: el emulador no comparte `localhost` con la máquina host.

**Solución**: en `.env` cambiar
```
API_URL=http://10.0.2.2:3000/v1
SOCKET_URL=ws://10.0.2.2:3000
```
`10.0.2.2` es el alias del host en Android emulador. Reiniciar Metro con `--clear`.

### Dispositivo físico Android/iOS no llega al backend local

**Causa**: `localhost` apunta al propio dispositivo.

**Solución**: usar la IP LAN de la máquina donde corre el backend.
```bash
# en Windows:
ipconfig         # busca IPv4 (ej. 192.168.1.42)
```
Luego en `.env`:
```
API_URL=http://192.168.1.42:3000/v1
```
Asegurarse de que el firewall permita conexiones al puerto 3000.

### Backend devuelve 429 / Account locked

**Causa**: rate limiter de auth (5 intentos / 15 min) o lockout de cuenta tras 5 logins fallidos.

**Solución**: esperar 15 minutos, o resetear la DB en dev:
```bash
cd backend
rm prisma/dev.db
npx prisma db push
npx tsx prisma/seed.ts
```

### Pre-commit / Husky bloquea commits

Hoy no hay hooks instalados. Si aparecen, revisar `.husky/` y `package.json` scripts.

### TS grita por `colors.neutral[400]` y similares

Errores TS pre-existentes (deuda 🟢 §9). En runtime funciona porque RN ignora colores undefined. Para callarlos: completar la paleta en `src/presentation/theme/colors.ts` con los tonos faltantes.

### Faltan tipos para `@react-native-community/netinfo`

Error TS pre-existente. Resolver instalando los types o añadiendo declaración en `src/types/`. No bloquea bundle.
