import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { createEmergency, getEmergency, updateLocation, cancelEmergency, notifyContacts, getHistory } from '../controllers/emergency.controller';

const router = Router();

router.use(authenticate);

router.post('/', createEmergency);
router.get('/history', getHistory);
router.get('/:id', getEmergency);
router.patch('/:id/location', updateLocation);
router.post('/:id/cancel', cancelEmergency);
router.post('/:id/notify-contacts', notifyContacts);

export default router;
