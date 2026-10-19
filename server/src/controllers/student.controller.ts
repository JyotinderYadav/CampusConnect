import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { createError } from '../middleware/error.middleware';
import { checkEligibility, calculateProfileCompletion } from '../services/eligibility.service';

const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  rollNumber: z.string().optional(),
  graduationYear: z.number().int().optional(),
  branch: z.string().optional(),
  degree: z.string().optional(),
  cgpa: z.number().min(0).max(10).optional(),
  class10Percent: z.number().min(0).max(100).optional(),
  class12Percent: z.number().min(0).max(100).optional(),
  activeBacklogs: z.number().int().min(0).optional(),
  backlogHistory: z.number().int().min(0).optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
  portfolioUrl: z.string().url().optional().or(z.literal('')),
  bio: z.string().max(500).optional(),
});

const skillSchema = z.object({
  skillName: z.string().min(1),
  proficiency: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).default('BEGINNER'),
});

const projectSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  technologies: z.string().optional(),
  githubUrl: z.string().url().optional().or(z.literal('')),
  liveUrl: z.string().url().optional().or(z.literal('')),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

const experienceSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  description: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  isCurrent: z.boolean().default(false),
});

const certificationSchema = z.object({
  title: z.string().min(1),
  issuer: z.string().min(1),
  issueDate: z.string().datetime().optional(),
  expiryDate: z.string().datetime().optional(),
  credentialUrl: z.string().url().optional().or(z.literal('')),
});

async function getStudentProfile(userId: string) {
  const profile = await prisma.studentProfile.findUnique({
    where: { userId },
    include: {
      skills: { include: { skill: true } },
      projects: true,
      experiences: true,
      certifications: true,
      resumes: { orderBy: { createdAt: 'desc' } },
    },
  });
  return profile;
}

export async function getMyProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const profile = await getStudentProfile(req.user!.id);
    if (!profile) throw createError('Student profile not found', 404);
    res.json({ success: true, data: { profile } });
  } catch (err) {
    next(err);
  }
}

export async function updateMyProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = updateProfileSchema.parse(req.body);

    let profile = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    if (!profile) throw createError('Student profile not found', 404);

    const updated = await prisma.studentProfile.update({
      where: { id: profile.id },
      data: {
        ...data,
      },
    });

    // Recalculate profile completion
    const completion = calculateProfileCompletion(updated);
    const withCompletion = await prisma.studentProfile.update({
      where: { id: profile.id },
      data: { profileComplete: completion },
    });

    res.json({ success: true, data: { profile: withCompletion } });
  } catch (err) {
    next(err);
  }
}

export async function getMyApplications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    if (!profile) throw createError('Student profile not found', 404);

    const applications = await prisma.application.findMany({
      where: { studentId: profile.id },
      include: {
        drive: {
          include: {
            company: { select: { name: true, logoUrl: true } },
          },
        },
        resume: { select: { originalName: true } },
      },
      orderBy: { appliedAt: 'desc' },
    });

    res.json({ success: true, data: { applications } });
  } catch (err) {
    next(err);
  }
}

export async function getEligibleDrives(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id },
    });
    if (!profile) throw createError('Student profile not found', 404);

    const drives = await prisma.placementDrive.findMany({
      where: {
        collegeId: req.user!.collegeId,
        status: 'PUBLISHED',
        applicationCloseDate: { gte: new Date() },
      },
      include: {
        company: { select: { id: true, name: true, logoUrl: true, industry: true } },
        eligibleBranches: true,
        eligibilityCriteria: true,
        _count: { select: { applications: true } },
      },
    });

    const result = drives.map((drive) => {
      const eligibility = checkEligibility(profile, drive);
      return { ...drive, eligibility };
    });

    res.json({ success: true, data: { drives: result } });
  } catch (err) {
    next(err);
  }
}

export async function getMyBookmarks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    if (!profile) throw createError('Student profile not found', 404);

    const bookmarks = await prisma.bookmark.findMany({
      where: { studentId: profile.id },
      include: {
        drive: {
          include: {
            company: { select: { name: true, logoUrl: true } },
          },
        },
      },
    });

    res.json({ success: true, data: { bookmarks } });
  } catch (err) {
    next(err);
  }
}

export async function addBookmark(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { driveId } = req.params;
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    if (!profile) throw createError('Student profile not found', 404);

    const drive = await prisma.placementDrive.findUnique({ where: { id: driveId } });
    if (!drive) throw createError('Drive not found', 404);

    const bookmark = await prisma.bookmark.create({
      data: { studentId: profile.id, driveId },
    });

    res.status(201).json({ success: true, data: { bookmark } });
  } catch (err) {
    next(err);
  }
}

export async function removeBookmark(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { driveId } = req.params;
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    if (!profile) throw createError('Student profile not found', 404);

    await prisma.bookmark.deleteMany({
      where: { studentId: profile.id, driveId },
    });

    res.json({ success: true, data: { message: 'Bookmark removed' } });
  } catch (err) {
    next(err);
  }
}

export async function uploadResume(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) throw createError('No file uploaded', 400);

    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    if (!profile) throw createError('Student profile not found', 404);

    // Get resume count
    const resumeCount = await prisma.resume.count({ where: { studentId: profile.id } });

    const resume = await prisma.resume.create({
      data: {
        studentId: profile.id,
        filename: req.file.filename,
        originalName: req.file.originalname,
        fileUrl: `/uploads/resumes/${req.file.filename}`,
        fileSize: req.file.size,
        isDefault: resumeCount === 0,
        version: resumeCount + 1,
      },
    });

    res.status(201).json({ success: true, data: { resume } });
  } catch (err) {
    next(err);
  }
}

export async function deleteResume(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { resumeId } = req.params;
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    if (!profile) throw createError('Student profile not found', 404);

    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, studentId: profile.id },
    });
    if (!resume) throw createError('Resume not found', 404);

    // Delete file from disk
    const filePath = path.join(process.cwd(), 'uploads', 'resumes', resume.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await prisma.resume.delete({ where: { id: resumeId } });

    res.json({ success: true, data: { message: 'Resume deleted' } });
  } catch (err) {
    next(err);
  }
}

export async function setDefaultResume(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { resumeId } = req.params;
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    if (!profile) throw createError('Student profile not found', 404);

    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, studentId: profile.id },
    });
    if (!resume) throw createError('Resume not found', 404);

    await prisma.$transaction([
      prisma.resume.updateMany({
        where: { studentId: profile.id },
        data: { isDefault: false },
      }),
      prisma.resume.update({
        where: { id: resumeId },
        data: { isDefault: true },
      }),
    ]);

    res.json({ success: true, data: { message: 'Default resume updated' } });
  } catch (err) {
    next(err);
  }
}

export async function downloadResume(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { resumeId } = req.params;
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    if (!profile) throw createError('Student profile not found', 404);

    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, studentId: profile.id },
    });
    if (!resume) throw createError('Resume not found', 404);

    const filePath = path.join(process.cwd(), 'uploads', 'resumes', resume.filename);
    if (!fs.existsSync(filePath)) throw createError('File not found on server', 404);

    res.download(filePath, resume.originalName);
  } catch (err) {
    next(err);
  }
}

// Skills
export async function addSkill(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = skillSchema.parse(req.body);
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    if (!profile) throw createError('Student profile not found', 404);

    // Upsert skill
    const skill = await prisma.skill.upsert({
      where: { name: data.skillName },
      update: {},
      create: { name: data.skillName },
    });

    const studentSkill = await prisma.studentSkill.create({
      data: { studentId: profile.id, skillId: skill.id, proficiency: data.proficiency },
      include: { skill: true },
    });

    res.status(201).json({ success: true, data: { skill: studentSkill } });
  } catch (err) {
    next(err);
  }
}

export async function updateSkill(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { skillId } = req.params;
    const { proficiency } = req.body as { proficiency: string };
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    if (!profile) throw createError('Student profile not found', 404);

    const updated = await prisma.studentSkill.update({
      where: { id: skillId },
      data: { proficiency },
      include: { skill: true },
    });

    res.json({ success: true, data: { skill: updated } });
  } catch (err) {
    next(err);
  }
}

export async function removeSkill(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { skillId } = req.params;
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    if (!profile) throw createError('Student profile not found', 404);

    await prisma.studentSkill.delete({ where: { id: skillId } });
    res.json({ success: true, data: { message: 'Skill removed' } });
  } catch (err) {
    next(err);
  }
}

// Projects
export async function addProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = projectSchema.parse(req.body);
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    if (!profile) throw createError('Student profile not found', 404);

    const project = await prisma.project.create({
      data: {
        studentId: profile.id,
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    });

    res.status(201).json({ success: true, data: { project } });
  } catch (err) {
    next(err);
  }
}

export async function updateProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { projectId } = req.params;
    const data = projectSchema.partial().parse(req.body);
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    if (!profile) throw createError('Student profile not found', 404);

    const project = await prisma.project.findFirst({ where: { id: projectId, studentId: profile.id } });
    if (!project) throw createError('Project not found', 404);

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    });

    res.json({ success: true, data: { project: updated } });
  } catch (err) {
    next(err);
  }
}

export async function deleteProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { projectId } = req.params;
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    if (!profile) throw createError('Student profile not found', 404);

    await prisma.project.deleteMany({ where: { id: projectId, studentId: profile.id } });
    res.json({ success: true, data: { message: 'Project deleted' } });
  } catch (err) {
    next(err);
  }
}

// Experiences
export async function addExperience(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = experienceSchema.parse(req.body);
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    if (!profile) throw createError('Student profile not found', 404);

    const experience = await prisma.experience.create({
      data: {
        studentId: profile.id,
        ...data,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    });

    res.status(201).json({ success: true, data: { experience } });
  } catch (err) {
    next(err);
  }
}

export async function updateExperience(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { experienceId } = req.params;
    const data = experienceSchema.partial().parse(req.body);
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    if (!profile) throw createError('Student profile not found', 404);

    const exp = await prisma.experience.findFirst({ where: { id: experienceId, studentId: profile.id } });
    if (!exp) throw createError('Experience not found', 404);

    const updated = await prisma.experience.update({
      where: { id: experienceId },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    });

    res.json({ success: true, data: { experience: updated } });
  } catch (err) {
    next(err);
  }
}

export async function deleteExperience(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { experienceId } = req.params;
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    if (!profile) throw createError('Student profile not found', 404);

    await prisma.experience.deleteMany({ where: { id: experienceId, studentId: profile.id } });
    res.json({ success: true, data: { message: 'Experience deleted' } });
  } catch (err) {
    next(err);
  }
}

// Certifications
export async function addCertification(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = certificationSchema.parse(req.body);
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    if (!profile) throw createError('Student profile not found', 404);

    const cert = await prisma.certification.create({
      data: {
        studentId: profile.id,
        ...data,
        issueDate: data.issueDate ? new Date(data.issueDate) : undefined,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
      },
    });

    res.status(201).json({ success: true, data: { certification: cert } });
  } catch (err) {
    next(err);
  }
}

export async function updateCertification(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { certId } = req.params;
    const data = certificationSchema.partial().parse(req.body);
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    if (!profile) throw createError('Student profile not found', 404);

    const cert = await prisma.certification.findFirst({ where: { id: certId, studentId: profile.id } });
    if (!cert) throw createError('Certification not found', 404);

    const updated = await prisma.certification.update({
      where: { id: certId },
      data: {
        ...data,
        issueDate: data.issueDate ? new Date(data.issueDate) : undefined,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
      },
    });

    res.json({ success: true, data: { certification: updated } });
  } catch (err) {
    next(err);
  }
}

export async function deleteCertification(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { certId } = req.params;
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    if (!profile) throw createError('Student profile not found', 404);

    await prisma.certification.deleteMany({ where: { id: certId, studentId: profile.id } });
    res.json({ success: true, data: { message: 'Certification deleted' } });
  } catch (err) {
    next(err);
  }
}
