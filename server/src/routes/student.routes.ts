import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { uploadResume as uploadResumeMiddleware } from '../middleware/upload.middleware';
import * as student from '../controllers/student.controller';

const router = Router();

router.use(authenticate, authorize('STUDENT'));

router.get('/me', student.getMyProfile);
router.patch('/me', student.updateMyProfile);
router.get('/me/applications', student.getMyApplications);
router.get('/me/eligible-drives', student.getEligibleDrives);

// Bookmarks
router.get('/me/bookmarks', student.getMyBookmarks);
router.post('/me/bookmarks/:driveId', student.addBookmark);
router.delete('/me/bookmarks/:driveId', student.removeBookmark);

// Resumes
router.post('/me/resumes', (req, res, next) => {
  uploadResumeMiddleware(req, res, (err) => {
    if (err) {
      res.status(400).json({ success: false, error: err.message });
      return;
    }
    next();
  });
}, student.uploadResume);
router.delete('/me/resumes/:resumeId', student.deleteResume);
router.patch('/me/resumes/:resumeId/default', student.setDefaultResume);
router.get('/me/resumes/:resumeId/download', student.downloadResume);

// Skills
router.post('/me/skills', student.addSkill);
router.patch('/me/skills/:skillId', student.updateSkill);
router.delete('/me/skills/:skillId', student.removeSkill);

// Projects
router.post('/me/projects', student.addProject);
router.patch('/me/projects/:projectId', student.updateProject);
router.delete('/me/projects/:projectId', student.deleteProject);

// Experiences
router.post('/me/experiences', student.addExperience);
router.patch('/me/experiences/:experienceId', student.updateExperience);
router.delete('/me/experiences/:experienceId', student.deleteExperience);

// Certifications
router.post('/me/certifications', student.addCertification);
router.patch('/me/certifications/:certId', student.updateCertification);
router.delete('/me/certifications/:certId', student.deleteCertification);

export default router;
