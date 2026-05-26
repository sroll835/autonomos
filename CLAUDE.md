# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**AUTONOMOS** — automotive services platform (Colombia → LATAM). React Native mobile app + Express/Prisma backend. Monorepo with two independent runtimes.

## Commands

### Mobile (root)
```bash
npx expo start          # dev server (Expo Go)
npx expo start --android
npx expo start --ios
npm run lint            # expo lint
npm test                # jest --watchAll
npm run test:coverage
```

### Backend (`backend/`)
```bash
npm run dev             # tsx watch (hot reload)
npm run build           # tsc compile
npm start               # run compiled dist/

npx prisma db push      # sync schema → SQLite
npx tsx prisma/seed.ts  # seed data
npx prisma studio       # DB GUI
```

### Build / Deploy
```bash
eas build --platform android
eas build --platform ios
eas update --branch production --message "desc"
```

## Architecture

### Clean Architecture (mobile)

```
src/
  domain/           # pure TS — entities, repository interfaces, use cases
  infrastructure/   # implements domain interfaces — Axios client, repos, Socket.io, storage
  presentation/     # UI layer — Zustand stores, hooks, UI components, theme
  shared/           # i18n (ES/EN), validators, formatters, constants
app/                # Expo Router file-based routes
```

Data flow: `app/ screen` → `presentation/stores/` (Zustand) → `domain/usecases/` → `infrastructure/repositories/` → API

**Never import `infrastructure/` or `presentation/` from `domain/`** — domain is pure and has no deps.

### API Client (`src/infrastructure/api/client.ts`)
- Auto-attaches Bearer token from `expo-secure-store` on every request
- Silent token refresh on 401 with queued retry — failed requests replay after new token issued
- All API endpoints centralized in `src/infrastructure/api/endpoints.ts`
- Base URL from `app.config.ts` extra → `Constants.expoConfig.extra.apiUrl` (defaults to `localhost:6000/v1`)

### Auth flow
- JWT access token stored in `expo-secure-store` (secure), user object in `AsyncStorage` via Zustand persist
- `useAuthStore` (`src/presentation/stores/authStore.ts`) is the single source of auth state
- Roles: `CONDUCTOR` (default), `PROVEEDOR`, `ADMIN`

### Real-time (`src/infrastructure/socket/socketClient.ts`)
- Socket.io client connects after login
- Used for: order tracking, service request updates, emergency SOS, chat

### Backend (`backend/src/`)
```
controllers/   # request handlers
routes/        # Express Router, mounted at /v1
middleware/    # auth JWT verify, zod validate, errorHandler
services/      # socket.service.ts — Socket.io server
utils/         # jwt, password (bcrypt), response helpers
config/env.ts  # typed env vars via dotenv
```

### Database (Prisma + SQLite)
Key models: `User`, `Vehicle`, `Provider`, `Order`, `OrderItem`, `ServiceRequest`, `ChatMessage`, `Emergency`, `Review`, `Document`, `Notification`

After schema changes: `npx prisma db push` (dev) — generates new Prisma client automatically.

### Navigation (Expo Router v3)
File-based routing. Groups:
- `(auth)/` — login, register, onboarding (no tab bar)
- `(tabs)/` — home, marketplace, services, orders, profile
- `emergency/`, `product/[id]`, `service/[id]`, `tracking/[orderId]`, `checkout/`, `chat/[serviceId]`

### Env vars
Mobile reads via `app.config.ts` → `Constants.expoConfig.extra.*`:
- `API_URL`, `SOCKET_URL`, `GOOGLE_MAPS_KEY`, `EAS_PROJECT_ID`

Backend reads via `backend/src/config/env.ts`:
- `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `PORT`, `CORS_ORIGINS`, `RATE_LIMIT_*`, `NODE_ENV`

Copy `.env.example` → `.env` in both root and `backend/` before running.
