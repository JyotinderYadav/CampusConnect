import request from 'supertest';
import app from '../index';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

export async function createTestCollege(code = 'TEST001') {
  return prisma.college.upsert({
    where: { code },
    update: {},
    create: {
      name: 'Test Institute',
      code,
    },
  });
}

export async function createTestUser(
  email: string,
  role: string,
  collegeId: string,
  profileData?: { firstName?: string; lastName?: string },
) {
  const password = await bcrypt.hash('Test@12345', 12);
  const user = await prisma.user.create({
    data: {
      email,
      password,
      role,
      collegeId,
      isEmailVerified: true,
      isActive: true,
    },
  });

  if (role === 'STUDENT') {
    await prisma.studentProfile.create({
      data: {
        userId: user.id,
        firstName: profileData?.firstName || 'Test',
        lastName: profileData?.lastName || 'Student',
        branch: 'CSE',
        graduationYear: 2025,
        cgpa: 8.0,
        class10Percent: 85,
        class12Percent: 80,
        activeBacklogs: 0,
        backlogHistory: 0,
      },
    });
  }

  return user;
}

export async function loginAs(email: string): Promise<string> {
  const res = await request(app).post('/api/auth/login').send({ email, password: 'Test@12345' });
  const cookies = res.headers['set-cookie'];
  if (Array.isArray(cookies)) return cookies[0];
  return cookies || '';
}

export async function createTestCompany(name = 'TestCorp') {
  return prisma.company.upsert({
    where: { name } as never,
    update: {},
    create: { name, industry: 'Technology' },
  });
}

export async function createTestDrive(
  collegeId: string,
  companyId: string,
  status = 'PUBLISHED',
) {
  return prisma.placementDrive.create({
    data: {
      collegeId,
      companyId,
      title: 'Software Engineer',
      jobType: 'FULL_TIME',
      applicationOpenDate: new Date(),
      applicationCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status,
      eligibleBranches: {
        create: [{ branch: 'CSE' }, { branch: 'ECE' }],
      },
      eligibilityCriteria: {
        create: {
          minCgpa: 7.0,
          maxActiveBacklogs: 0,
          allowBacklogHistory: false,
        },
      },
    },
  });
}
