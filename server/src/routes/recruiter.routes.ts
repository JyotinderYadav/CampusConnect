import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import * as recruiter from '../controllers/recruiter.controller';

const router = Router();

router.use(authenticate, authorize('RECRUITER'));

router.get('/profile', recruiter.getRecruiterProfile);
router.patch('/profile', recruiter.updateRecruiterProfile);
router.get('/drives', recruiter.getRecruiterDrives);
router.get('/drives/:driveId/applications', recruiter.getRecruiterDriveApplications);
router.patch('/applications/:applicationId/status', recruiter.updateApplicationStatusRecruiter);

export default router;
