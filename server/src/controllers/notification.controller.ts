import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { createError } from '../middleware/error.middleware';

export async function getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { unread, page = '1', limit = '20' } = req.query as Record<string, string>;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const where: Record<string, unknown> = { userId: req.user!.id };
    if (unread === 'true') where.isRead = false;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId: req.user!.id, isRead: false } }),
    ]);

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: { page: parseInt(page, 10), limit: take, total, pages: Math.ceil(total / take) },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!notification) throw createError('Notification not found', 404);

    await prisma.notification.update({ where: { id }, data: { isRead: true } });

    res.json({ success: true, data: { message: 'Notification marked as read' } });
  } catch (err) {
    next(err);
  }
}

export async function markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.id, isRead: false },
      data: { isRead: true },
    });

    res.json({ success: true, data: { message: 'All notifications marked as read' } });
  } catch (err) {
    next(err);
  }
}

export async function deleteNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!notification) throw createError('Notification not found', 404);

    await prisma.notification.delete({ where: { id } });

    res.json({ success: true, data: { message: 'Notification deleted' } });
  } catch (err) {
    next(err);
  }
}
