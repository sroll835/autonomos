import { Router } from 'express';
import authRoutes from './auth.routes';
import usersRoutes from './users.routes';
import productsRoutes from './products.routes';
import ordersRoutes from './orders.routes';
import servicesRoutes from './services.routes';
import emergencyRoutes from './emergency.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/products', productsRoutes);
router.use('/orders', ordersRoutes);
router.use('/services', servicesRoutes);
router.use('/emergency', emergencyRoutes);

router.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

export default router;
