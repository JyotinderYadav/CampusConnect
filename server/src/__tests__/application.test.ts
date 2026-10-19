import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../index';
import { prisma } from '../lib/prisma';
import {
  createTestCollege,
  createTestUser,
  createTestCompany,
  createTestDrive,
  loginAs,
} from './helpers';

let collegeId: string;
let studentCookie: string;
let student2Cookie: string;
let officerCookie: string;
let driveId: string;
let applicationId: string;
let studentProfileId: string;

beforeAll(async () => {
  const college = await createTestCollege('APP001');
  collegeId = college.id;

  // Create users
  const student1 = await createTestUser(`student1_app_${Date.now()}@test.com`, 'STUDENT', collegeId);
  const student2 = await createTestUser(`student2_app_${Date.now()}@test.com`, 'STUDENT', collegeId);
  const officer = await createTestUser(`officer_app_${Date.now()}@test.com`, 'PLACEMENT_OFFICER', collegeId);

  // Get cookies
  studentCookie = await loginAs(student1.email);
  student2Cookie = await loginAs(student2.email);
  officerCookie = await loginAs(officer.email);

  const profile = await prisma.studentProfile.findUnique({ where: { userId: student1.id } });
  studentProfileId = profile!.id;

  const company = await createTestCompany('AppTestCorp');
  const drive = await createTestDrive(collegeId, company.id, 'PUBLISHED');
  driveId = drive.id;
});

describe('Application Routes', () => {
  it('should allow eligible student to apply', async () => {
    const res = await request(app)
      .post(`/api/drives/${driveId}/applications`)
      .set('Cookie', studentCookie)
      .send({});

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    applicationId = res.body.data.application.id;
  });

  it('should return 409 for duplicate application', async () => {
    const res = await request(app)
      .post(`/api/drives/${driveId}/applications`)
      .set('Cookie', studentCookie)
      .send({});

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should allow ineligible student to be blocked (low CGPA)', async () => {
    // Create a student with low CGPA
    const lowCgpaUser = await createTestUser(`lowcgpa_${Date.now()}@test.com`, 'STUDENT', collegeId);
    await prisma.studentProfile.update({
      where: { userId: lowCgpaUser.id },
      data: { cgpa: 5.0, branch: 'CSE' },
    });

    const lowCgpaCookie = await loginAs(lowCgpaUser.email);

    const res = await request(app)
      .post(`/api/drives/${driveId}/applications`)
      .set('Cookie', lowCgpaCookie)
      .send({});

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.details).toBeDefined();
  });

  it('should allow officer to update application status', async () => {
    const res = await request(app)
      .patch(`/api/applications/${applicationId}/status`)
      .set('Cookie', officerCookie)
      .send({ status: 'SHORTLISTED', note: 'Good profile' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.application.status).toBe('SHORTLISTED');
  });

  it('should get application history', async () => {
    const res = await request(app)
      .get(`/api/applications/${applicationId}/history`)
      .set('Cookie', officerCookie);

    expect(res.status).toBe(200);
    expect(res.body.data.history.length).toBeGreaterThan(0);
  });

  it('should allow student to get their own application', async () => {
    const res = await request(app)
      .get(`/api/applications/${applicationId}`)
      .set('Cookie', studentCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should NOT allow student2 to view student1 application', async () => {
    const res = await request(app)
      .get(`/api/applications/${applicationId}`)
      .set('Cookie', student2Cookie);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should NOT allow withdraw after status is not APPLIED', async () => {
    // applicationId is already SHORTLISTED at this point
    const res = await request(app)
      .delete(`/api/applications/${applicationId}`)
      .set('Cookie', studentCookie);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should allow student to withdraw APPLIED application', async () => {
    // Create a fresh application for student2
    const company2 = await createTestCompany(`AppTestCorp2_${Date.now()}`);
    const drive2 = await createTestDrive(collegeId, company2.id, 'PUBLISHED');

    const applyRes = await request(app)
      .post(`/api/drives/${drive2.id}/applications`)
      .set('Cookie', student2Cookie)
      .send({});

    expect(applyRes.status).toBe(201);
    const app2Id = applyRes.body.data.application.id;

    const withdrawRes = await request(app)
      .delete(`/api/applications/${app2Id}`)
      .set('Cookie', student2Cookie);

    expect(withdrawRes.status).toBe(200);
    expect(withdrawRes.body.success).toBe(true);
  });
});
