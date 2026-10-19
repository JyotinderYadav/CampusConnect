import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as notif from '../controllers/notification.controller';

const router = Router();

router.use(authenticate);

router.get('/', notif.getNotifications);
router.patch('/:id/read', notif.markAsRead);
router.post('/read-all', notif.markAllAsRead);
router.delete('/:id', notif.deleteNotification);

export default router;
