import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { signToken, setAuthCookie, clearAuthCookie } from '../lib/jwt';
import { sendEmail, verifyEmailTemplate, passwordResetTemplate } from '../lib/email';
import { createError } from '../middleware/error.middleware';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[A-Z])(?=.*[0-9])/, {
    message: 'Password must contain at least one uppercase letter and one number',
  }),
  role: z.enum(['STUDENT', 'RECRUITER', 'PLACEMENT_OFFICER']),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  collegeCode: z.string().min(1),
  // Recruiter specific
  companyName: z.string().optional(),
  recruiterName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = registerSchema.parse(req.body);

    if (data.role === 'PLACEMENT_OFFICER') {
      throw createError('Cannot self-register as Placement Officer', 403);
    }

    const college = await prisma.college.findUnique({ where: { code: data.collegeCode } });
    if (!college) {
      throw createError('Invalid college code', 400);
    }

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw createError('Email already registered', 409);
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const verifyToken = crypto.randomBytes(32).toString('hex');

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          role: data.role,
          collegeId: college.id,
          emailVerifyToken: verifyToken,
        },
      });

      if (data.role === 'STUDENT') {
        await tx.studentProfile.create({
          data: {
            userId: newUser.id,
            firstName: data.firstName || '',
            lastName: data.lastName || '',
          },
        });
      } else if (data.role === 'RECRUITER') {
        // Find or create company
        let company = await tx.company.findFirst({
          where: { name: { equals: data.companyName || '' } },
        });
        if (!company && data.companyName) {
          company = await tx.company.create({ data: { name: data.companyName } });
        }
        if (company) {
          await tx.recruiterProfile.create({
            data: {
              userId: newUser.id,
              companyId: company.id,
              name: data.recruiterName || data.email,
            },
          });
        }
      }

      return newUser;
    });

    // Send verification email
    await sendEmail(verifyEmailTemplate(verifyToken, data.email));

    res.status(201).json({
      success: true,
      data: { message: 'Registration successful. Please verify your email.' },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        studentProfile: { select: { id: true, firstName: true, lastName: true } },
        recruiterProfile: { select: { id: true, name: true } },
      },
    });

    if (!user) {
      throw createError('Invalid email or password', 401);
    }

    if (!user.isActive) {
      throw createError('Account is deactivated. Contact support.', 401);
    }

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      throw createError('Invalid email or password', 401);
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      collegeId: user.collegeId,
    });

    setAuthCookie(res, token);

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        entity: 'User',
        entityId: user.id,
        ipAddress: req.ip,
      },
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          collegeId: user.collegeId,
          profile: user.studentProfile || user.recruiterProfile,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  clearAuthCookie(res);
  res.json({ success: true, data: { message: 'Logged out successfully' } });
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        college: { select: { id: true, name: true, code: true } },
        studentProfile: {
          include: {
            skills: { include: { skill: true } },
            resumes: { select: { id: true, originalName: true, isDefault: true, createdAt: true } },
          },
        },
        recruiterProfile: { include: { company: true } },
      },
    });

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    const { password, emailVerifyToken, resetToken, resetTokenExpiry, ...safeUser } = user;

    res.json({ success: true, data: { user: safeUser } });
  } catch (err) {
    next(err);
  }
}

export async function verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { token, email } = req.body as { token: string; email: string };

    const user = await prisma.user.findFirst({
      where: { email, emailVerifyToken: token },
    });

    if (!user) {
      throw createError('Invalid or expired verification token', 400);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true, emailVerifyToken: null },
    });

    res.json({ success: true, data: { message: 'Email verified successfully' } });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = req.body as { email: string };

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken, resetTokenExpiry: expiry },
      });

      await sendEmail(passwordResetTemplate(resetToken, email));
    }

    res.json({
      success: true,
      data: { message: 'If that email is registered, a reset link has been sent.' },
    });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { token, email, password } = req.body as {
      token: string;
      email: string;
      password: string;
    };

    const user = await prisma.user.findFirst({
      where: {
        email,
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      throw createError('Invalid or expired reset token', 400);
    }

    const hashed = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, resetToken: null, resetTokenExpiry: null },
    });

    res.json({ success: true, data: { message: 'Password reset successfully' } });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { currentPassword, newPassword } = req.body as {
      currentPassword: string;
      newPassword: string;
    };

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) throw createError('User not found', 404);

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) throw createError('Current password is incorrect', 400);

    const hashed = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    });

    res.json({ success: true, data: { message: 'Password changed successfully' } });
  } catch (err) {
    next(err);
  }
}
