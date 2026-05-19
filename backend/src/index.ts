import express from 'express';
import { createServer } from 'http';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import routes from './routes';
import { initSocket } from './services/socket.service';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const app = express();
const server = createServer(app);

// Security headers
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
}));

// CORS
app.use(cors({
  origin: (origin, cb) => {
    // En desarrollo permite cualquier localhost
    if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      cb(null, true);
      return;
    }
    const allowed = env.CORS_ORIGINS.split(',').map((o) => o.trim());
    if (allowed.includes(origin)) cb(null, true);
    else cb(new Error('CORS no permitido'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// General rate limit
app.use(rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Demasiadas solicitudes' },
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
}

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Routes
app.use('/v1', routes);

// Errors
app.use(notFoundHandler);
app.use(errorHandler);

// Socket.io
initSocket(server);

server.listen(env.PORT, () => {
  console.log(`🚀 AUTONOMOS API corriendo en http://localhost:${env.PORT}/v1`);
  console.log(`📋 Health: http://localhost:${env.PORT}/v1/health`);
  console.log(`🌍 Entorno: ${env.NODE_ENV}`);
});

export default app;
