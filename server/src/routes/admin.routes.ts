import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import * as admin from '../controllers/admin.controller';

const router = Router();

router.use(authenticate, authorize('PLACEMENT_OFFICER'));

router.get('/overview', admin.getOverview);
router.get('/students', admin.listStudents);
router.get('/students/:id', admin.getStudent);
router.patch('/students/:id', admin.updateStudent);
router.get('/analytics', admin.getAnalytics);
router.get('/reports/csv', admin.exportCSV);
router.get('/settings', admin.getSettings);
router.patch('/settings', admin.updateSettings);
router.post('/announcements', admin.createAnnouncement);

export default router;
