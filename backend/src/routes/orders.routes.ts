import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { createOrder, getOrders, getOrderById, cancelOrder, trackOrder } from '../controllers/orders.controller';

const router = Router();

router.use(authenticate);

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.post('/:id/cancel', cancelOrder);
router.get('/:id/track', trackOrder);

export default router;
