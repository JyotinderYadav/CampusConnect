import { prisma } from '../lib/prisma';

export async function notifyNewDrivePublished(driveId: string, collegeId: string): Promise<void> {
  try {
    const drive = await prisma.placementDrive.findUnique({
      where: { id: driveId },
      include: {
        company: { select: { name: true } },
        eligibleBranches: true,
        eligibilityCriteria: true,
      },
    });

    if (!drive) return;

    // Get all active students in the college
    const students = await prisma.user.findMany({
      where: { collegeId, role: 'STUDENT', isActive: true },
      select: { id: true },
    });

    const notifications = students.map((s) => ({
      userId: s.id,
      type: 'NEW_DRIVE',
      title: `New Drive: ${drive.company.name}`,
      message: `${drive.company.name} is hiring for ${drive.title}. Apply before ${new Date(drive.applicationCloseDate).toLocaleDateString()}.`,
      data: JSON.stringify({ driveId }),
    }));

    if (notifications.length > 0) {
      await prisma.notification.createMany({ data: notifications });
    }
  } catch (err) {
    console.error('[NotificationService] notifyNewDrivePublished error:', err);
  }
}

export async function notifyApplicationConfirmed(applicationId: string): Promise<void> {
  try {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        student: { include: { user: { select: { id: true } } } },
        drive: { include: { company: { select: { name: true } } } },
      },
    });

    if (!app) return;

    await prisma.notification.create({
      data: {
        userId: app.student.user.id,
        type: 'APPLICATION_CONFIRMED',
        title: 'Application Submitted',
        message: `Your application for ${app.drive.company.name} - ${app.drive.title} has been submitted successfully.`,
        data: JSON.stringify({ applicationId, driveId: app.driveId }),
      },
    });
  } catch (err) {
    console.error('[NotificationService] notifyApplicationConfirmed error:', err);
  }
}

export async function notifyStatusUpdated(
  applicationId: string,
  newStatus: string,
): Promise<void> {
  try {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        student: { include: { user: { select: { id: true } } } },
        drive: { include: { company: { select: { name: true } } } },
      },
    });

    if (!app) return;

    const statusMessages: Record<string, string> = {
      UNDER_REVIEW: 'Your application is under review.',
      SHORTLISTED: 'Congratulations! You have been shortlisted.',
      ASSESSMENT: 'You have been moved to assessment round.',
      TECHNICAL_INTERVIEW: 'You have a technical interview scheduled.',
      HR_INTERVIEW: 'You have an HR interview scheduled.',
      SELECTED: '🎉 Congratulations! You have been selected!',
      REJECTED: 'Your application was not selected this time.',
    };

    const message = statusMessages[newStatus] || `Application status updated to ${newStatus}.`;
    const typeMap: Record<string, string> = {
      SHORTLISTED: 'SHORTLISTED',
      REJECTED: 'REJECTED',
    };

    await prisma.notification.create({
      data: {
        userId: app.student.user.id,
        type: typeMap[newStatus] || 'STATUS_UPDATE',
        title: `Application Update: ${app.drive.company.name}`,
        message,
        data: JSON.stringify({ applicationId, driveId: app.driveId, status: newStatus }),
      },
    });
  } catch (err) {
    console.error('[NotificationService] notifyStatusUpdated error:', err);
  }
}

export async function notifyInterviewScheduled(
  applicationId: string,
  interviewId: string,
): Promise<void> {
  try {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        student: { include: { user: { select: { id: true } } } },
        drive: { include: { company: { select: { name: true } } } },
      },
    });

    const interview = await prisma.interview.findUnique({ where: { id: interviewId } });

    if (!app || !interview) return;

    await prisma.notification.create({
      data: {
        userId: app.student.user.id,
        type: 'INTERVIEW_SCHEDULED',
        title: `Interview Scheduled: ${app.drive.company.name}`,
        message: `Your interview is scheduled for ${new Date(interview.scheduledAt).toLocaleString()}.`,
        data: JSON.stringify({ applicationId, driveId: app.driveId, interviewId }),
      },
    });
  } catch (err) {
    console.error('[NotificationService] notifyInterviewScheduled error:', err);
  }
}

export async function notifyAnnouncementPublished(announcementId: string): Promise<void> {
  try {
    const ann = await prisma.announcement.findUnique({ where: { id: announcementId } });
    if (!ann) return;

    const roleFilter = ann.targetRoles
      ? ann.targetRoles.split(',').map((r) => r.trim())
      : ['STUDENT', 'PLACEMENT_OFFICER', 'RECRUITER'];

    const users = await prisma.user.findMany({
      where: {
        collegeId: ann.collegeId,
        role: { in: roleFilter },
        isActive: true,
      },
      select: { id: true },
    });

    if (users.length === 0) return;

    await prisma.notification.createMany({
      data: users.map((u) => ({
        userId: u.id,
        type: 'ANNOUNCEMENT',
        title: ann.title,
        message: ann.content.substring(0, 200) + (ann.content.length > 200 ? '...' : ''),
        data: JSON.stringify({ announcementId }),
      })),
    });
  } catch (err) {
    console.error('[NotificationService] notifyAnnouncementPublished error:', err);
  }
}
