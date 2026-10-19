import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { createError } from '../middleware/error.middleware';
import { notifyStatusUpdated, notifyInterviewScheduled } from '../services/notification.service';

const VALID_STATUSES = [
  'APPLIED',
  'UNDER_REVIEW',
  'SHORTLISTED',
  'ASSESSMENT',
  'TECHNICAL_INTERVIEW',
  'HR_INTERVIEW',
  'SELECTED',
  'REJECTED',
  'WITHDRAWN',
];

const interviewSchema = z.object({
  stageId: z.string().optional(),
  scheduledAt: z.string().datetime(),
  mode: z.enum(['ONLINE', 'IN_PERSON', 'TELEPHONIC']).default('ONLINE'),
  location: z.string().optional(),
  meetingLink: z.string().url().optional().or(z.literal('')),
  feedback: z.string().optional(),
  result: z.string().optional(),
});

export async function getApplication(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            rollNumber: true,
            branch: true,
            cgpa: true,
            user: { select: { email: true, id: true } },
          },
        },
        drive: {
          include: {
            company: { select: { name: true, logoUrl: true } },
          },
        },
        resume: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
        interviews: { include: { stage: true }, orderBy: { scheduledAt: 'asc' } },
      },
    });

    if (!application) throw createError('Application not found', 404);

    // Access control
    if (req.user!.role === 'STUDENT') {
      const studentProfile = await prisma.studentProfile.findUnique({
        where: { userId: req.user!.id },
      });
      if (!studentProfile || application.student.id !== studentProfile.id) {
        throw createError('Access denied', 403);
      }
    }

    res.json({ success: true, data: { application } });
  } catch (err) {
    next(err);
  }
}

export async function updateApplicationStatus(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;
    const { status, note } = req.body as { status: string; note?: string };

    if (!VALID_STATUSES.includes(status)) {
      throw createError(`Invalid status`, 400);
    }

    const application = await prisma.application.findUnique({
      where: { id },
      include: { drive: { select: { collegeId: true } } },
    });

    if (!application) throw createError('Application not found', 404);

    if (application.drive.collegeId !== req.user!.collegeId) {
      throw createError('Access denied', 403);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedApp = await tx.application.update({
        where: { id },
        data: { status },
      });

      await tx.applicationStatusHistory.create({
        data: {
          applicationId: id,
          status,
          changedBy: req.user!.id,
          note: note || null,
        },
      });

      return updatedApp;
    });

    notifyStatusUpdated(id, status).catch(console.error);

    res.json({ success: true, data: { application: updated } });
  } catch (err) {
    next(err);
  }
}

export async function getApplicationHistory(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;

    const application = await prisma.application.findUnique({
      where: { id },
      include: { drive: { select: { collegeId: true } } },
    });

    if (!application) throw createError('Application not found', 404);

    if (
      req.user!.role === 'STUDENT' ||
      application.drive.collegeId !== req.user!.collegeId
    ) {
      // For students, verify they own this application
      if (req.user!.role === 'STUDENT') {
        const studentProfile = await prisma.studentProfile.findUnique({
          where: { userId: req.user!.id },
        });
        if (!studentProfile || application.studentId !== studentProfile.id) {
          throw createError('Access denied', 403);
        }
      }
    }

    const history = await prisma.applicationStatusHistory.findMany({
      where: { applicationId: id },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ success: true, data: { history } });
  } catch (err) {
    next(err);
  }
}

export async function scheduleInterview(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;
    const data = interviewSchema.parse(req.body);

    const application = await prisma.application.findUnique({
      where: { id },
      include: { drive: { select: { collegeId: true } } },
    });

    if (!application) throw createError('Application not found', 404);

    if (application.drive.collegeId !== req.user!.collegeId) {
      throw createError('Access denied', 403);
    }

    const interview = await prisma.interview.create({
      data: {
        applicationId: id,
        stageId: data.stageId || null,
        scheduledAt: new Date(data.scheduledAt),
        mode: data.mode,
        location: data.location || null,
        meetingLink: data.meetingLink || null,
        feedback: data.feedback || null,
        result: data.result || null,
      },
    });

    notifyInterviewScheduled(id, interview.id).catch(console.error);

    res.status(201).json({ success: true, data: { interview } });
  } catch (err) {
    next(err);
  }
}

export async function withdrawApplication(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id },
    });
    if (!studentProfile) throw createError('Student profile not found', 404);

    const application = await prisma.application.findUnique({ where: { id } });
    if (!application) throw createError('Application not found', 404);

    if (application.studentId !== studentProfile.id) {
      throw createError('Access denied', 403);
    }

    if (application.status !== 'APPLIED') {
      throw createError(
        'Cannot withdraw application that is past the initial applied stage',
        400,
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.application.update({ where: { id }, data: { status: 'WITHDRAWN' } });
      await tx.applicationStatusHistory.create({
        data: {
          applicationId: id,
          status: 'WITHDRAWN',
          changedBy: req.user!.id,
          note: 'Application withdrawn by student',
        },
      });
    });

    res.json({ success: true, data: { message: 'Application withdrawn successfully' } });
  } catch (err) {
    next(err);
  }
}
