import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getNearbyProviders, createService, getServiceById,
  acceptQuote, rejectQuote, completeService, cancelService,
  getMessages, sendMessage,
} from '../controllers/services.controller';

const router = Router();

router.get('/providers/nearby', getNearbyProviders);
router.use(authenticate);
router.post('/', createService);
router.get('/:id', getServiceById);
router.post('/:id/accept', acceptQuote);
router.post('/:id/reject', rejectQuote);
router.post('/:id/complete', completeService);
router.post('/:id/cancel', cancelService);
router.get('/:id/messages', getMessages);
router.post('/:id/messages', sendMessage);

export default router;
