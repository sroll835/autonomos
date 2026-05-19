import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  updateProfile, getVehicles, addVehicle, deleteVehicle,
  getEmergencyContacts, addEmergencyContact, deleteEmergencyContact,
  getPaymentMethods, addPaymentMethod, deletePaymentMethod,
  getNotifications, markNotificationRead, markAllNotificationsRead,
  getMyReviews, getDocuments, deleteDocument,
} from '../controllers/users.controller';

const router = Router();

router.use(authenticate);

router.patch('/profile', updateProfile);
router.get('/vehicles', getVehicles);
router.post('/vehicles', addVehicle);
router.delete('/vehicles/:id', deleteVehicle);
router.get('/emergency-contacts', getEmergencyContacts);
router.post('/emergency-contacts', addEmergencyContact);
router.delete('/emergency-contacts/:id', deleteEmergencyContact);
router.get('/payment-methods', getPaymentMethods);
router.post('/payment-methods', addPaymentMethod);
router.delete('/payment-methods/:id', deletePaymentMethod);
router.get('/reviews', getMyReviews);
router.get('/documents', getDocuments);
router.delete('/documents/:id', deleteDocument);

export default router;
