import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import * as drive from '../controllers/drive.controller';

const router = Router();

router.use(authenticate);

// Public (any authenticated user)
router.get('/', drive.listDrives);
router.get('/:id', drive.getDrive);

// Apply to drive (STUDENT only)
router.post('/:id/applications', authorize('STUDENT'), drive.applyToDrive);

// View drive applications (PLACEMENT_OFFICER or RECRUITER)
router.get(
  '/:id/applications',
  authorize('PLACEMENT_OFFICER', 'RECRUITER'),
  drive.getDriveApplications,
);

// Management (PLACEMENT_OFFICER only)
router.post('/', authorize('PLACEMENT_OFFICER'), drive.createDrive);
router.patch('/:id', authorize('PLACEMENT_OFFICER'), drive.updateDrive);
router.delete('/:id', authorize('PLACEMENT_OFFICER'), drive.deleteDrive);
router.patch('/:id/status', authorize('PLACEMENT_OFFICER'), drive.updateDriveStatus);
router.post('/:id/stages', authorize('PLACEMENT_OFFICER'), drive.addRecruitmentStage);

export default router;
