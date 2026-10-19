import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import * as app from '../controllers/application.controller';

const router = Router();

router.use(authenticate);

router.get('/:id', app.getApplication);
router.get('/:id/history', app.getApplicationHistory);
router.patch(
  '/:id/status',
  authorize('PLACEMENT_OFFICER', 'RECRUITER'),
  app.updateApplicationStatus,
);
router.post('/:id/interviews', authorize('PLACEMENT_OFFICER', 'RECRUITER'), app.scheduleInterview);
router.delete('/:id', authorize('STUDENT'), app.withdrawApplication);

export default router;
