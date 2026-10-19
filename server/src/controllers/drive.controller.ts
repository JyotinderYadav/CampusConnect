import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { createError } from '../middleware/error.middleware';
import { checkEligibility } from '../services/eligibility.service';
import { notifyNewDrivePublished, notifyApplicationConfirmed } from '../services/notification.service';

const driveCreateSchema = z.object({
  companyId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  jobType: z.enum(['INTERNSHIP', 'FULL_TIME', 'INTERNSHIP_TO_FULL_TIME']),
  ctc: z.number().positive().optional(),
  stipend: z.number().positive().optional(),
  packageBreakdown: z.string().optional(),
  location: z.string().optional(),
  workMode: z.enum(['ON_SITE', 'REMOTE', 'HYBRID']).default('ON_SITE'),
  vacancies: z.number().int().positive().optional(),
  applicationOpenDate: z.string().datetime(),
  applicationCloseDate: z.string().datetime(),
  eligibleBranches: z.array(z.string()).optional(),
  eligibilityCriteria: z
    .object({
      minCgpa: z.number().optional(),
      minClass10: z.number().optional(),
      minClass12: z.number().optional(),
      maxActiveBacklogs: z.number().int().default(0),
      allowBacklogHistory: z.boolean().default(false),
      graduationYears: z.string().optional(),
    })
    .optional(),
  stages: z
    .array(
      z.object({
        name: z.string().min(1),
        order: z.number().int(),
        description: z.string().optional(),
      }),
    )
    .optional(),
});

const VALID_STATUSES = ['DRAFT', 'PENDING_APPROVAL', 'PUBLISHED', 'CLOSED', 'ARCHIVED'];

export async function listDrives(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      status,
      branch,
      jobType,
      search,
      page = '1',
      limit = '20',
      companyId,
    } = req.query as Record<string, string>;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const where: Record<string, unknown> = {
      collegeId: req.user?.collegeId,
    };

    if (status) where.status = status;
    if (jobType) where.jobType = jobType;
    if (companyId) where.companyId = companyId;

    if (branch) {
      where.eligibleBranches = { some: { branch } };
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { company: { name: { contains: search } } },
        { description: { contains: search } },
      ];
    }

    const [drives, total] = await Promise.all([
      prisma.placementDrive.findMany({
        where,
        include: {
          company: { select: { id: true, name: true, logoUrl: true, industry: true } },
          eligibleBranches: true,
          eligibilityCriteria: true,
          _count: { select: { applications: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.placementDrive.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        drives,
        pagination: {
          page: parseInt(page, 10),
          limit: take,
          total,
          pages: Math.ceil(total / take),
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getDrive(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const drive = await prisma.placementDrive.findFirst({
      where: { id, collegeId: req.user?.collegeId },
      include: {
        company: true,
        eligibleBranches: true,
        eligibilityCriteria: true,
        skillRequirements: { include: { skill: true } },
        stages: { orderBy: { order: 'asc' } },
        _count: { select: { applications: true } },
      },
    });

    if (!drive) throw createError('Drive not found', 404);

    let eligibility = null;
    if (req.user?.role === 'STUDENT') {
      const studentProfile = await prisma.studentProfile.findUnique({
        where: { userId: req.user.id },
      });
      if (studentProfile) {
        eligibility = checkEligibility(studentProfile, drive);
      }

      // Check if student has already applied
      const application = await prisma.application.findFirst({
        where: { studentId: studentProfile?.id || '', driveId: id },
        select: { id: true, status: true },
      });

      res.json({ success: true, data: { drive, eligibility, application } });
      return;
    }

    res.json({ success: true, data: { drive } });
  } catch (err) {
    next(err);
  }
}

export async function createDrive(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = driveCreateSchema.parse(req.body);

    const company = await prisma.company.findUnique({ where: { id: data.companyId } });
    if (!company) throw createError('Company not found', 404);

    const drive = await prisma.$transaction(async (tx) => {
      const newDrive = await tx.placementDrive.create({
        data: {
          collegeId: req.user!.collegeId,
          companyId: data.companyId,
          title: data.title,
          description: data.description,
          jobType: data.jobType,
          ctc: data.ctc,
          stipend: data.stipend,
          packageBreakdown: data.packageBreakdown,
          location: data.location,
          workMode: data.workMode,
          vacancies: data.vacancies,
          applicationOpenDate: new Date(data.applicationOpenDate),
          applicationCloseDate: new Date(data.applicationCloseDate),
          status: 'DRAFT',
          createdBy: req.user!.id,
        },
      });

      if (data.eligibleBranches && data.eligibleBranches.length > 0) {
        await tx.driveEligibleBranch.createMany({
          data: data.eligibleBranches.map((branch) => ({ driveId: newDrive.id, branch })),
        });
      }

      if (data.eligibilityCriteria) {
        await tx.eligibilityCriteria.create({
          data: {
            driveId: newDrive.id,
            ...data.eligibilityCriteria,
          },
        });
      }

      if (data.stages && data.stages.length > 0) {
        await tx.recruitmentStage.createMany({
          data: data.stages.map((s) => ({ ...s, driveId: newDrive.id })),
        });
      }

      return newDrive;
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'CREATE',
        entity: 'PlacementDrive',
        entityId: drive.id,
        ipAddress: req.ip,
      },
    });

    res.status(201).json({ success: true, data: { drive } });
  } catch (err) {
    next(err);
  }
}

export async function updateDrive(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const data = driveCreateSchema.partial().parse(req.body);

    const drive = await prisma.placementDrive.findFirst({
      where: { id, collegeId: req.user!.collegeId },
    });
    if (!drive) throw createError('Drive not found', 404);

    const updated = await prisma.$transaction(async (tx) => {
      const updatedDrive = await tx.placementDrive.update({
        where: { id },
        data: {
          ...data,
          applicationOpenDate: data.applicationOpenDate
            ? new Date(data.applicationOpenDate)
            : undefined,
          applicationCloseDate: data.applicationCloseDate
            ? new Date(data.applicationCloseDate)
            : undefined,
          eligibleBranches: undefined,
          eligibilityCriteria: undefined,
          stages: undefined,
        },
      });

      if (data.eligibleBranches) {
        await tx.driveEligibleBranch.deleteMany({ where: { driveId: id } });
        if (data.eligibleBranches.length > 0) {
          await tx.driveEligibleBranch.createMany({
            data: data.eligibleBranches.map((branch) => ({ driveId: id, branch })),
          });
        }
      }

      if (data.eligibilityCriteria) {
        await tx.eligibilityCriteria.upsert({
          where: { driveId: id },
          update: data.eligibilityCriteria,
          create: { driveId: id, ...data.eligibilityCriteria },
        });
      }

      return updatedDrive;
    });

    res.json({ success: true, data: { drive: updated } });
  } catch (err) {
    next(err);
  }
}

export async function deleteDrive(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const drive = await prisma.placementDrive.findFirst({
      where: { id, collegeId: req.user!.collegeId },
    });
    if (!drive) throw createError('Drive not found', 404);

    if (drive.status === 'PUBLISHED') {
      throw createError('Cannot delete a published drive. Close or archive it first.', 400);
    }

    await prisma.placementDrive.delete({ where: { id } });
    res.json({ success: true, data: { message: 'Drive deleted' } });
  } catch (err) {
    next(err);
  }
}

export async function updateDriveStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body as { status: string };

    if (!VALID_STATUSES.includes(status)) {
      throw createError(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`, 400);
    }

    const drive = await prisma.placementDrive.findFirst({
      where: { id, collegeId: req.user!.collegeId },
    });
    if (!drive) throw createError('Drive not found', 404);

    const updated = await prisma.placementDrive.update({
      where: { id },
      data: { status },
    });

    // Notify students when drive is published
    if (status === 'PUBLISHED') {
      notifyNewDrivePublished(id, req.user!.collegeId).catch(console.error);
    }

    res.json({ success: true, data: { drive: updated } });
  } catch (err) {
    next(err);
  }
}

export async function applyToDrive(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: driveId } = req.params;
    const { resumeId } = req.body as { resumeId?: string };

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id },
    });
    if (!studentProfile) throw createError('Student profile not found', 404);

    const drive = await prisma.placementDrive.findFirst({
      where: { id: driveId, collegeId: req.user!.collegeId, status: 'PUBLISHED' },
      include: { eligibleBranches: true, eligibilityCriteria: true },
    });
    if (!drive) throw createError('Drive not found or not open for applications', 404);

    // Check deadline
    if (new Date() > new Date(drive.applicationCloseDate)) {
      throw createError('Application deadline has passed', 400);
    }

    // Check eligibility
    const eligibility = checkEligibility(studentProfile, drive);
    if (!eligibility.eligible) {
      res.status(403).json({
        success: false,
        error: 'You are not eligible for this drive',
        details: eligibility.unmet,
      });
      return;
    }

    // Check existing application
    const existing = await prisma.application.findUnique({
      where: { studentId_driveId: { studentId: studentProfile.id, driveId } },
    });
    if (existing) throw createError('You have already applied to this drive', 409);

    // If resumeId provided, verify ownership
    if (resumeId) {
      const resume = await prisma.resume.findFirst({
        where: { id: resumeId, studentId: studentProfile.id },
      });
      if (!resume) throw createError('Resume not found', 404);
    }

    const application = await prisma.$transaction(async (tx) => {
      const app = await tx.application.create({
        data: {
          studentId: studentProfile.id,
          driveId,
          resumeId: resumeId || null,
          status: 'APPLIED',
        },
      });

      await tx.applicationStatusHistory.create({
        data: {
          applicationId: app.id,
          status: 'APPLIED',
          changedBy: req.user!.id,
          note: 'Application submitted',
        },
      });

      return app;
    });

    notifyApplicationConfirmed(application.id).catch(console.error);

    res.status(201).json({ success: true, data: { application } });
  } catch (err) {
    next(err);
  }
}

export async function getDriveApplications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: driveId } = req.params;
    const { status, page = '1', limit = '50', search } = req.query as Record<string, string>;

    const drive = await prisma.placementDrive.findFirst({
      where: { id: driveId, collegeId: req.user!.collegeId },
    });
    if (!drive) throw createError('Drive not found', 404);

    // Recruiters can only see their company's drives
    if (req.user!.role === 'RECRUITER') {
      const recruiterProfile = await prisma.recruiterProfile.findUnique({
        where: { userId: req.user!.id },
      });
      if (!recruiterProfile || recruiterProfile.companyId !== drive.companyId) {
        throw createError('Access denied', 403);
      }
    }

    const where: Record<string, unknown> = { driveId };
    if (status) where.status = status;

    if (search) {
      where.student = {
        OR: [
          { firstName: { contains: search } },
          { lastName: { contains: search } },
          { rollNumber: { contains: search } },
        ],
      };
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              rollNumber: true,
              branch: true,
              cgpa: true,
              graduationYear: true,
              photoUrl: true,
              user: { select: { email: true } },
            },
          },
          resume: { select: { id: true, originalName: true, fileUrl: true } },
        },
        orderBy: { appliedAt: 'desc' },
        skip,
        take,
      }),
      prisma.application.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        applications,
        pagination: { page: parseInt(page, 10), limit: take, total, pages: Math.ceil(total / take) },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function addRecruitmentStage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: driveId } = req.params;
    const { name, order, description } = req.body as {
      name: string;
      order: number;
      description?: string;
    };

    const drive = await prisma.placementDrive.findFirst({
      where: { id: driveId, collegeId: req.user!.collegeId },
    });
    if (!drive) throw createError('Drive not found', 404);

    const stage = await prisma.recruitmentStage.create({
      data: { driveId, name, order, description },
    });

    res.status(201).json({ success: true, data: { stage } });
  } catch (err) {
    next(err);
  }
}
