import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { createError } from '../middleware/error.middleware';
import { notifyStatusUpdated } from '../services/notification.service';

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  designation: z.string().optional(),
  phone: z.string().optional(),
});

export async function getRecruiterProfile(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const profile = await prisma.recruiterProfile.findUnique({
      where: { userId: req.user!.id },
      include: { company: true },
    });

    if (!profile) throw createError('Recruiter profile not found', 404);

    res.json({ success: true, data: { profile } });
  } catch (err) {
    next(err);
  }
}

export async function updateRecruiterProfile(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const data = updateProfileSchema.parse(req.body);

    const profile = await prisma.recruiterProfile.update({
      where: { userId: req.user!.id },
      data,
      include: { company: true },
    });

    res.json({ success: true, data: { profile } });
  } catch (err) {
    next(err);
  }
}

export async function getRecruiterDrives(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const recruiterProfile = await prisma.recruiterProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!recruiterProfile) throw createError('Recruiter profile not found', 404);

    const drives = await prisma.placementDrive.findMany({
      where: { companyId: recruiterProfile.companyId },
      include: {
        company: { select: { name: true, logoUrl: true } },
        college: { select: { name: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: { drives } });
  } catch (err) {
    next(err);
  }
}

export async function getRecruiterDriveApplications(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { driveId } = req.params;
    const recruiterProfile = await prisma.recruiterProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!recruiterProfile) throw createError('Recruiter profile not found', 404);

    const drive = await prisma.placementDrive.findFirst({
      where: { id: driveId, companyId: recruiterProfile.companyId },
    });

    if (!drive) throw createError('Drive not found or access denied', 403);

    const { status, page = '1', limit = '50' } = req.query as Record<string, string>;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const where: Record<string, unknown> = { driveId };
    if (status) where.status = status;

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

export async function updateApplicationStatusRecruiter(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { applicationId } = req.params;
    const { status, note } = req.body as { status: string; note?: string };

    const recruiterProfile = await prisma.recruiterProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!recruiterProfile) throw createError('Recruiter profile not found', 404);

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { drive: true },
    });

    if (!application) throw createError('Application not found', 404);

    if (application.drive.companyId !== recruiterProfile.companyId) {
      throw createError('Access denied', 403);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedApp = await tx.application.update({
        where: { id: applicationId },
        data: { status },
      });

      await tx.applicationStatusHistory.create({
        data: {
          applicationId,
          status,
          changedBy: req.user!.id,
          note: note || null,
        },
      });

      return updatedApp;
    });

    notifyStatusUpdated(applicationId, status).catch(console.error);

    res.json({ success: true, data: { application: updated } });
  } catch (err) {
    next(err);
  }
}
