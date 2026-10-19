import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { createError } from '../middleware/error.middleware';
import { notifyAnnouncementPublished } from '../services/notification.service';

export async function getOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const collegeId = req.user!.collegeId;

    const [
      totalStudents,
      totalDrives,
      activeDrives,
      totalApplications,
      selectedCount,
      companies,
    ] = await Promise.all([
      prisma.studentProfile.count({
        where: { user: { collegeId, isActive: true } },
      }),
      prisma.placementDrive.count({ where: { collegeId } }),
      prisma.placementDrive.count({ where: { collegeId, status: 'PUBLISHED' } }),
      prisma.application.count({
        where: { drive: { collegeId } },
      }),
      prisma.application.count({
        where: { drive: { collegeId }, status: 'SELECTED' },
      }),
      prisma.company.count({
        where: { drives: { some: { collegeId } } },
      }),
    ]);

    const placementRate =
      totalStudents > 0 ? Math.round((selectedCount / totalStudents) * 100) : 0;

    res.json({
      success: true,
      data: {
        overview: {
          totalStudents,
          totalDrives,
          activeDrives,
          totalApplications,
          selectedCount,
          companies,
          placementRate,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function listStudents(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      page = '1',
      limit = '20',
      branch,
      graduationYear,
      search,
      isPlaced,
    } = req.query as Record<string, string>;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);
    const collegeId = req.user!.collegeId;

    const where: Record<string, unknown> = {
      user: { collegeId, isActive: true },
    };

    if (branch) where.branch = branch;
    if (graduationYear) where.graduationYear = parseInt(graduationYear, 10);

    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { rollNumber: { contains: search } },
        { user: { email: { contains: search } } },
      ];
    }

    if (isPlaced === 'true') {
      where.applications = { some: { status: 'SELECTED' } };
    }

    const [students, total] = await Promise.all([
      prisma.studentProfile.findMany({
        where,
        include: {
          user: { select: { email: true, isEmailVerified: true, createdAt: true } },
          _count: { select: { applications: true } },
        },
        orderBy: [{ graduationYear: 'asc' }, { firstName: 'asc' }],
        skip,
        take,
      }),
      prisma.studentProfile.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        students,
        pagination: { page: parseInt(page, 10), limit: take, total, pages: Math.ceil(total / take) },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const collegeId = req.user!.collegeId;

    const student = await prisma.studentProfile.findFirst({
      where: { id, user: { collegeId } },
      include: {
        user: { select: { email: true, role: true, isEmailVerified: true, isActive: true } },
        skills: { include: { skill: true } },
        projects: true,
        experiences: true,
        certifications: true,
        resumes: { orderBy: { createdAt: 'desc' } },
        applications: {
          include: {
            drive: { include: { company: { select: { name: true } } } },
          },
          orderBy: { appliedAt: 'desc' },
        },
      },
    });

    if (!student) throw createError('Student not found', 404);

    res.json({ success: true, data: { student } });
  } catch (err) {
    next(err);
  }
}

export async function updateStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const collegeId = req.user!.collegeId;

    const student = await prisma.studentProfile.findFirst({
      where: { id, user: { collegeId } },
    });
    if (!student) throw createError('Student not found', 404);

    const updated = await prisma.studentProfile.update({
      where: { id },
      data: req.body,
    });

    res.json({ success: true, data: { student: updated } });
  } catch (err) {
    next(err);
  }
}

export async function getAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const collegeId = req.user!.collegeId;

    // Branch-wise placement
    const branchStats = await prisma.studentProfile.groupBy({
      by: ['branch'],
      where: { user: { collegeId } },
      _count: { id: true },
    });

    const branchPlacements = await prisma.application.groupBy({
      by: ['studentId'],
      where: { status: 'SELECTED', drive: { collegeId } },
      _count: { studentId: true },
    });

    // Company-wise offers
    const companyStats = await prisma.application.groupBy({
      by: ['driveId'],
      where: { status: 'SELECTED', drive: { collegeId } },
      _count: { id: true },
    });

    const driveDetails = await prisma.placementDrive.findMany({
      where: { id: { in: companyStats.map((c) => c.driveId) } },
      include: { company: { select: { name: true } } },
    });

    const companyOffers = companyStats.map((cs) => {
      const drive = driveDetails.find((d) => d.id === cs.driveId);
      return {
        company: drive?.company.name || 'Unknown',
        driveTitle: drive?.title || '',
        offers: cs._count.id,
      };
    });

    // Year-wise stats
    const yearStats = await prisma.studentProfile.groupBy({
      by: ['graduationYear'],
      where: { user: { collegeId } },
      _count: { id: true },
    });

    res.json({
      success: true,
      data: {
        analytics: {
          branchStats: branchStats.map((b) => ({ branch: b.branch, total: b._count.id })),
          companyOffers,
          yearStats: yearStats.map((y) => ({ year: y.graduationYear, total: y._count.id })),
          placedStudents: branchPlacements.length,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function exportCSV(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const collegeId = req.user!.collegeId;

    const students = await prisma.studentProfile.findMany({
      where: { user: { collegeId } },
      include: {
        user: { select: { email: true } },
        applications: {
          where: { status: 'SELECTED' },
          include: { drive: { include: { company: { select: { name: true } } } } },
          take: 1,
        },
      },
    });

    const headers = [
      'Roll Number',
      'First Name',
      'Last Name',
      'Email',
      'Branch',
      'Degree',
      'Graduation Year',
      'CGPA',
      'Class 10%',
      'Class 12%',
      'Active Backlogs',
      'Status',
      'Placed Company',
      'Profile Complete %',
    ].join(',');

    const rows = students.map((s) => {
      const placed = s.applications.length > 0;
      const company = placed ? s.applications[0].drive.company.name : '';
      const escapeCSV = (v: unknown) => {
        const str = v === null || v === undefined ? '' : String(v);
        return `"${str.replace(/"/g, '""')}"`;
      };
      return [
        escapeCSV(s.rollNumber),
        escapeCSV(s.firstName),
        escapeCSV(s.lastName),
        escapeCSV(s.user.email),
        escapeCSV(s.branch),
        escapeCSV(s.degree),
        escapeCSV(s.graduationYear),
        escapeCSV(s.cgpa),
        escapeCSV(s.class10Percent),
        escapeCSV(s.class12Percent),
        escapeCSV(s.activeBacklogs),
        escapeCSV(placed ? 'Placed' : 'Not Placed'),
        escapeCSV(company),
        escapeCSV(s.profileComplete),
      ].join(',');
    });

    const csv = [headers, ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="placement_report_${Date.now()}.csv"`);
    res.send(csv);
  } catch (err) {
    next(err);
  }
}

export async function getSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const collegeId = req.user!.collegeId;

    const settings = await prisma.collegeSettings.findUnique({ where: { collegeId } });

    if (!settings) {
      // Return defaults
      res.json({
        success: true,
        data: {
          settings: {
            collegeId,
            maxOffersPerStudent: 1,
            allowMultipleOffers: false,
            requireEmailVerification: false,
            placementYear: new Date().getFullYear(),
          },
        },
      });
      return;
    }

    res.json({ success: true, data: { settings } });
  } catch (err) {
    next(err);
  }
}

export async function updateSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const collegeId = req.user!.collegeId;
    const { maxOffersPerStudent, allowMultipleOffers, requireEmailVerification, placementYear } =
      req.body as {
        maxOffersPerStudent?: number;
        allowMultipleOffers?: boolean;
        requireEmailVerification?: boolean;
        placementYear?: number;
      };

    const settings = await prisma.collegeSettings.upsert({
      where: { collegeId },
      update: { maxOffersPerStudent, allowMultipleOffers, requireEmailVerification, placementYear },
      create: {
        collegeId,
        maxOffersPerStudent: maxOffersPerStudent ?? 1,
        allowMultipleOffers: allowMultipleOffers ?? false,
        requireEmailVerification: requireEmailVerification ?? false,
        placementYear,
      },
    });

    res.json({ success: true, data: { settings } });
  } catch (err) {
    next(err);
  }
}

const announcementSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  targetRoles: z.string().optional(),
});

export async function createAnnouncement(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const data = announcementSchema.parse(req.body);
    const collegeId = req.user!.collegeId;

    const announcement = await prisma.announcement.create({
      data: {
        collegeId,
        title: data.title,
        content: data.content,
        createdBy: req.user!.id,
        targetRoles: data.targetRoles,
      },
    });

    notifyAnnouncementPublished(announcement.id).catch(console.error);

    res.status(201).json({ success: true, data: { announcement } });
  } catch (err) {
    next(err);
  }
}
