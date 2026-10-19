import { Request, Response, NextFunction } from 'express';
import { verifyToken, COOKIE_NAME, JwtPayload } from '../lib/jwt';
import { prisma } from '../lib/prisma';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & { id: string };
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const payload = verifyToken(token);

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, isActive: true, role: true, email: true, collegeId: true },
    });

    if (!user || !user.isActive) {
      res.status(401).json({ success: false, error: 'Account not found or deactivated' });
      return;
    }

    req.user = {
      ...payload,
      id: user.id,
      role: user.role,
      email: user.email,
      collegeId: user.collegeId,
    };

    next();
  } catch (err) {
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}

export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: `Access denied. Required role: ${roles.join(' or ')}`,
      });
      return;
    }
    next();
  };
}

export async function requireStudentOwnership(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { user } = req;
    if (!user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    if (user.role === 'PLACEMENT_OFFICER') {
      next();
      return;
    }

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!studentProfile) {
      res.status(404).json({ success: false, error: 'Student profile not found' });
      return;
    }

    (req as Request & { studentProfileId: string }).studentProfileId = studentProfile.id;
    next();
  } catch (err) {
    next(err);
  }
}
